import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb/connection'
import Profile, { IProfile } from '@/lib/mongodb/models/Profile'
import Track from '@/lib/mongodb/models/Track'
import Enrollment from '@/lib/mongodb/models/Enrollment'
import mongoose from 'mongoose'

export async function POST(request: NextRequest) {
  try {
    const { user_id, goal, track_slug } = await request.json()

    if (!user_id || !goal || !track_slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectDB()

    const updateData: Partial<IProfile> = { goal, onboarding_completed: true }
    await Profile.findByIdAndUpdate(user_id, updateData)

    const track = await Track.findOne({ slug: track_slug }).lean()
    if (track) {
      await Enrollment.findOneAndUpdate(
        { user_id: new mongoose.Types.ObjectId(user_id), track_id: track._id },
        { user_id, track_id: track._id, status: 'active', current_day: 1 },
        { upsert: true, new: true }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save onboarding'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
