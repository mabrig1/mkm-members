import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb/connection'
import { Track, Task, Enrollment, UserTask } from '@/lib/mongodb/models'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id?: string }).id!
  const { trackId } = await params

  await connectDB()

  const [track, tasks, enrollment] = await Promise.all([
    Track.findById(trackId).lean(),
    Task.find({ track_id: trackId }).sort({ day_number: 1 }).lean(),
    Enrollment.findOne({ user_id: userId, track_id: trackId }).lean(),
  ])

  if (!track) return NextResponse.json({ error: 'Track not found' }, { status: 404 })

  // Get completed task IDs for this user
  const completedTasks = await UserTask.find({
    user_id: userId,
    track_id: trackId,
    status: { $in: ['approved', 'graded'] },
  })
    .select('task_id final_score')
    .lean()

  const completedMap = new Map(
    completedTasks.map((ut) => [ut.task_id.toString(), ut.final_score ?? 0])
  )

  const currentDay = enrollment?.current_day ?? 0

  const curriculum = tasks.map((t) => ({
    _id: t._id.toString(),
    day_number: t.day_number,
    title: t.title,
    submission_type: t.submission_type,
    xp_reward: t.xp_reward,
    naira_reward: t.naira_reward,
    is_current: t.day_number === currentDay,
    is_completed: completedMap.has(t._id.toString()),
    is_locked: t.day_number > currentDay,
    score: completedMap.get(t._id.toString()),
  }))

  return NextResponse.json({
    track: { ...track, _id: track._id.toString() },
    curriculum,
    enrollment: enrollment
      ? {
          status: enrollment.status,
          current_day: enrollment.current_day,
          progress_percentage: enrollment.progress_percentage,
        }
      : null,
  })
}
