import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb/connection'
import { Gig, GigApplication } from '@/lib/mongodb/models'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ gigId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id?: string }).id!
  const { gigId } = await params

  await connectDB()

  const [gig, application] = await Promise.all([
    Gig.findById(gigId).populate('client_id', 'full_name role created_at total_earned').lean(),
    GigApplication.findOne({ gig_id: gigId, user_id: userId }).lean(),
  ])

  if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 })

  // Compute client stats (gigs posted + avg rating) from other gigs
  const clientGigs = await Gig.find({
    client_id: gig.client_id,
    client_rating: { $exists: true, $ne: null },
  })
    .select('client_rating')
    .lean()

  const avgRating =
    clientGigs.length > 0
      ? clientGigs.reduce((s, g) => s + (g.client_rating ?? 0), 0) / clientGigs.length
      : null

  const totalPosted = await Gig.countDocuments({ client_id: gig.client_id })

  return NextResponse.json({
    gig: {
      ...gig,
      _id: gig._id.toString(),
      client_stats: { avg_rating: avgRating, total_posted: totalPosted },
    },
    has_applied: !!application,
    application: application
      ? { pitch: application.pitch, proposed_timeline_hours: application.proposed_timeline_hours, created_at: application.created_at }
      : null,
    is_assigned: gig.assigned_to?.toString() === userId,
    is_client: gig.client_id?.toString() === userId ||
      (gig.client_id as { _id?: { toString(): string } })?._id?.toString() === userId,
  })
}
