import { NextRequest, NextResponse } from 'next/server'
import { gradeSubmission } from '@/lib/anthropic/grader'
import { connectDB } from '@/lib/mongodb/connection'
import { Task, Track, UserTask, Profile } from '@/lib/mongodb/models'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_task_id, submission_content, task_id } = body

    await connectDB()

    const task = await Task.findById(task_id).lean()
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

    const track = await Track.findById(task.track_id).select('category').lean()

    const gradingResult = await gradeSubmission({
      task_title: task.title,
      task_description: task.description,
      task_instructions: task.instructions,
      submission_type: task.submission_type,
      grading_rubric: task.grading_rubric as Record<string, number>,
      user_submission: submission_content,
      skill_category: track?.category || 'general',
    })

    const updatedUserTask = await UserTask.findByIdAndUpdate(
      user_task_id,
      {
        ai_score: gradingResult.total_score,
        ai_feedback: gradingResult,
        status: gradingResult.passed ? 'approved' : 'graded',
        final_score: gradingResult.total_score,
        graded_at: new Date(),
      },
      { new: true }
    ).lean()

    if (gradingResult.passed && updatedUserTask) {
      await Profile.findByIdAndUpdate(updatedUserTask.user_id, {
        $inc: { xp_points: task.xp_reward },
      })
    }

    return NextResponse.json({ success: true, result: gradingResult })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Grading error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
