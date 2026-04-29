import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb/connection'
import { Track, Enrollment } from '@/lib/mongodb/models'
import mongoose from 'mongoose'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id?: string }).id!
  const { track_id } = await request.json()

  if (!track_id) return NextResponse.json({ error: 'track_id is required' }, { status: 400 })

  await connectDB()

  const track = await Track.findById(track_id).lean()
  if (!track) return NextResponse.json({ error: 'Track not found' }, { status: 404 })

  const existing = await Enrollment.findOne({ user_id: userId, track_id }).lean()
  if (existing) {
    return NextResponse.json({
      enrollment: { status: existing.status, current_day: existing.current_day },
      already_enrolled: true,
    })
  }

  const enrollment = await Enrollment.create({
    user_id: new mongoose.Types.ObjectId(userId),
    track_id: new mongoose.Types.ObjectId(track_id),
    status: 'active',
    current_day: 1,
    progress_percentage: 0,
  })

  await Track.findByIdAndUpdate(track_id, { $inc: { enrolled_count: 1 } })

  return NextResponse.json({ enrollment, already_enrolled: false }, { status: 201 })
}
