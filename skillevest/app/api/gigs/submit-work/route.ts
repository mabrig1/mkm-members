import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb/connection'
import { Gig, Notification } from '@/lib/mongodb/models'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id?: string }).id!
  const { gig_id, submission_url, submission_notes } = await request.json()

  if (!gig_id || !submission_url?.trim()) {
    return NextResponse.json({ error: 'gig_id and submission_url are required' }, { status: 400 })
  }

  await connectDB()

  const gig = await Gig.findById(gig_id).lean()
  if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 })
  if (gig.assigned_to?.toString() !== userId) {
    return NextResponse.json({ error: 'You are not assigned to this gig' }, { status: 403 })
  }
  if (!['assigned', 'in_review'].includes(gig.status)) {
    return NextResponse.json({ error: `Cannot submit work with status: ${gig.status}` }, { status: 409 })
  }

  // Store submission in gig metadata via deliverables update + status change
  await Gig.findByIdAndUpdate(gig_id, {
    status: 'submitted',
    submitted_at: new Date(),
    deliverables: submission_notes
      ? `${gig.deliverables}\n\n---\nSubmission: ${submission_url}\nNotes: ${submission_notes}`
      : `${gig.deliverables}\n\n---\nSubmission: ${submission_url}`,
  })

  // Notify client — 48-hour review window
  const reviewDeadline = new Date()
  reviewDeadline.setHours(reviewDeadline.getHours() + 48)

  await Notification.create({
    user_id: gig.client_id,
    title: '📦 Work Submitted — Review Required',
    body: `Work has been submitted for "${gig.title}". Please review within 48 hours (by ${reviewDeadline.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}).`,
    type: 'gig',
    action_url: `/gigs/${gig_id}`,
  })

  return NextResponse.json({ success: true, review_deadline: reviewDeadline.toISOString() })
}
