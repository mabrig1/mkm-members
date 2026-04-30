import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb/connection'
import { Task, Track, UserTask, Enrollment, Profile } from '@/lib/mongodb/models'
import { gradeSubmission } from '@/lib/anthropic/grader'
import mongoose from 'mongoose'

/* ── XP award + level-up ──────────────────────────────────── */
async function awardXP(userId: string, xpAmount: number): Promise<boolean> {
  const profile = await Profile.findByIdAndUpdate(
    userId,
    { $inc: { xp_points: xpAmount } },
    { new: true }
  ).lean()
  if (!profile) return false

  const xp = profile.xp_points
  const newLevel = xp >= 5000 ? 5 : xp >= 2000 ? 4 : xp >= 800 ? 3 : xp >= 200 ? 2 : 1
  const newRole =
    newLevel >= 5 ? 'mentor' : newLevel >= 4 ? 'pro' : newLevel >= 3 ? 'apprentice' : 'novice'

  if (newLevel > profile.level) {
    await Profile.findByIdAndUpdate(userId, { level: newLevel, role: newRole })
    return true // leveled up
  }
  return false
}

/* ── GET: task details + user task state ─────────────────── */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id?: string }).id!
  const { taskId } = await params

  await connectDB()

  const task = await Task.findById(taskId).lean()
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  const track = await Track.findById(task.track_id).select('title slug category duration_days').lean()
  if (!track) return NextResponse.json({ error: 'Track not found' }, { status: 404 })

  // Find or create UserTask
  let userTask = await UserTask.findOne({ user_id: userId, task_id: taskId }).lean()
  if (!userTask) {
    userTask = await UserTask.create({
      user_id: new mongoose.Types.ObjectId(userId),
      task_id: new mongoose.Types.ObjectId(taskId),
      track_id: task.track_id,
      status: 'pending',
      attempts: 0,
    })
  }

  // Find next task
  const nextTask = await Task.findOne({
    track_id: task.track_id,
    day_number: task.day_number + 1,
  })
    .select('_id')
    .lean()

  return NextResponse.json({
    task: { ...task, _id: task._id.toString() },
    track: { ...track, _id: track._id.toString() },
    userTask: { ...userTask, _id: userTask._id.toString() },
    nextTaskId: nextTask?._id.toString() ?? null,
  })
}

/* ── POST: submit + grade ─────────────────────────────────── */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id?: string }).id!
  const { taskId } = await params
  const { submission_content, submission_url } = await request.json()

  const content = submission_content || submission_url
  if (!content?.trim()) {
    return NextResponse.json({ error: 'Submission content is required' }, { status: 400 })
  }

  await connectDB()

  const task = await Task.findById(taskId).lean()
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  const [track, existingUserTask] = await Promise.all([
    Track.findById(task.track_id).select('title category slug duration_days').lean(),
    UserTask.findOne({ user_id: userId, task_id: taskId }),
  ])

  if (!track) return NextResponse.json({ error: 'Track not found' }, { status: 404 })

  const MAX_ATTEMPTS = 3
  const attempts = (existingUserTask?.attempts ?? 0) + 1

  if (existingUserTask && existingUserTask.status === 'approved') {
    return NextResponse.json({ error: 'Task already passed' }, { status: 409 })
  }
  if (attempts > MAX_ATTEMPTS) {
    return NextResponse.json({ error: 'Maximum attempts reached' }, { status: 400 })
  }

  // Grade via Claude
  const gradingResult = await gradeSubmission({
    task_title: task.title,
    task_description: task.description,
    task_instructions: task.instructions,
    submission_type: task.submission_type,
    grading_rubric: task.grading_rubric as Record<string, number>,
    user_submission: content,
    skill_category: track.category,
  })

  const newStatus = gradingResult.passed ? 'approved' : 'graded'

  const userTask = await UserTask.findOneAndUpdate(
    { user_id: userId, task_id: taskId },
    {
      $set: {
        submission_content: submission_content || undefined,
        submission_url: submission_url || undefined,
        ai_score: gradingResult.total_score,
        ai_feedback: gradingResult,
        status: newStatus,
        final_score: gradingResult.total_score,
        graded_at: new Date(),
        submitted_at: new Date(),
      },
      $setOnInsert: {
        user_id: new mongoose.Types.ObjectId(userId),
        task_id: new mongoose.Types.ObjectId(taskId),
        track_id: task.track_id,
      },
      $inc: { attempts: 1 },
    },
    { upsert: true, new: true }
  )

  let leveledUp = false
  let nextTaskId: string | null = null

  if (gradingResult.passed) {
    // Award XP and check level-up
    leveledUp = await awardXP(userId, task.xp_reward)

    // Advance enrollment day (only if this is the current day)
    const enrollment = await Enrollment.findOne({ user_id: userId, track_id: task.track_id })
    if (enrollment && enrollment.current_day === task.day_number) {
      const isLastDay = task.day_number >= track.duration_days
      await Enrollment.findByIdAndUpdate(enrollment._id, {
        $inc: { current_day: isLastDay ? 0 : 1 },
        progress_percentage: (task.day_number / track.duration_days) * 100,
        status: isLastDay ? 'completed' : 'active',
        ...(isLastDay ? { completed_at: new Date() } : {}),
      })
    }

    // Find next task
    const next = await Task.findOne({
      track_id: task.track_id,
      day_number: task.day_number + 1,
    })
      .select('_id')
      .lean()
    nextTaskId = next?._id.toString() ?? null
  }

  return NextResponse.json({
    gradingResult,
    userTask: { _id: userTask._id.toString(), status: userTask.status, attempts },
    nextTaskId,
    leveledUp,
    trackSlug: track.slug,
  })
}
