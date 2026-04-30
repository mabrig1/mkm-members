import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb/connection'
import { Gig, GigApplication, Profile, Notification } from '@/lib/mongodb/models'
import mongoose from 'mongoose'

const LEVEL_ORDER = ['novice', 'apprentice', 'pro', 'mentor', 'admin']

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id?: string }).id!
  const { gig_id, pitch, proposed_timeline_hours } = await request.json()

  if (!gig_id || !pitch?.trim()) {
    return NextResponse.json({ error: 'gig_id and pitch are required' }, { status: 400 })
  }

  await connectDB()

  const [gig, profile] = await Promise.all([
    Gig.findById(gig_id).lean(),
    Profile.findById(userId).lean(),
  ])

  if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 })
  if (gig.status !== 'open') return NextResponse.json({ error: 'This gig is no longer accepting applications' }, { status: 409 })
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // Level check
  const userLevelIdx = LEVEL_ORDER.indexOf(profile.role)
  const reqLevelIdx = LEVEL_ORDER.indexOf(gig.min_level ?? 'novice')
  if (userLevelIdx < reqLevelIdx) {
    return NextResponse.json(
      { error: `This gig requires ${gig.min_level} level or above. You are ${profile.role}.` },
      { status: 403 }
    )
  }

  // Dispute check
  const pendingDispute = await Gig.findOne({ assigned_to: userId, status: 'disputed' }).lean()
  if (pendingDispute) {
    return NextResponse.json(
      { error: 'You have a pending dispute. Resolve it before applying for new gigs.' },
      { status: 403 }
    )
  }

  // Duplicate check
  const existing = await GigApplication.findOne({ gig_id, user_id: userId }).lean()
  if (existing) return NextResponse.json({ error: 'You have already applied for this gig' }, { status: 409 })

  const application = await GigApplication.create({
    gig_id: new mongoose.Types.ObjectId(gig_id),
    user_id: new mongoose.Types.ObjectId(userId),
    pitch: pitch.trim(),
    proposed_timeline_hours: proposed_timeline_hours || undefined,
  })

  // Notify admin / client
  await Notification.create({
    user_id: gig.client_id,
    title: 'New Gig Application',
    body: `${profile.full_name} applied for "${gig.title}"`,
    type: 'gig',
    action_url: `/gigs/${gig_id}`,
  })

  return NextResponse.json({ success: true, application_id: application._id.toString() }, { status: 201 })
}
