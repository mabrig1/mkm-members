import { NextRequest, NextResponse } from 'next/server'
import { getIncomeCoachResponse } from '@/lib/anthropic/grader'
import { connectDB } from '@/lib/mongodb/connection'
import { Profile, Enrollment } from '@/lib/mongodb/models'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, user_id } = body

    await connectDB()

    const profile = await Profile.findById(user_id)
      .select('role total_earned streak_days')
      .lean()

    const enrollment = await Enrollment.findOne({ user_id, status: 'active' })
      .populate<{ track_id: { title: string } }>('track_id', 'title')
      .lean()

    const response = await getIncomeCoachResponse(message, {
      role: profile?.role || 'novice',
      track: enrollment?.track_id?.title,
      earnings: profile?.total_earned || 0,
      streak: profile?.streak_days || 0,
    })

    return NextResponse.json({ response })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
