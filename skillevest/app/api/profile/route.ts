import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb/connection'
import { Profile, Enrollment, UserTask, Gig } from '@/lib/mongodb/models'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id?: string }).id!

  await connectDB()

  const [profile, completedEnrollments, tasksCount, gigsCount, referredCount] = await Promise.all([
    Profile.findById(userId)
      .select('-password_hash')
      .lean(),
    Enrollment.find({ user_id: userId, status: 'completed' })
      .populate('track_id', 'title category')
      .lean(),
    UserTask.countDocuments({ user_id: userId, status: 'graded' }),
    Gig.countDocuments({ assigned_to: userId, status: 'approved' }),
    Profile.countDocuments({ referred_by: userId }),
  ])

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  return NextResponse.json({
    profile,
    stats: {
      tasks_completed: tasksCount,
      gigs_completed: gigsCount,
      referred_count: referredCount,
      tracks_completed: completedEnrollments.length,
    },
    completed_tracks: completedEnrollments.map((e) => e.track_id),
  })
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id?: string }).id!
  const body = await request.json()

  const allowed = ['full_name', 'phone', 'whatsapp_optin', 'fiverr_username', 'upwork_profile_url', 'state', 'bio']
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  await connectDB()

  const updated = await Profile.findByIdAndUpdate(userId, update, { new: true })
    .select('-password_hash')
    .lean()

  return NextResponse.json({ profile: updated })
}
