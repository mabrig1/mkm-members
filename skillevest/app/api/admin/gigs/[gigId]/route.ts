import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb/connection'
import { Gig, Profile, Transaction } from '@/lib/mongodb/models'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) return null
  if ((session.user as { role?: string }).role !== 'admin') return null
  return session
}

const VALID_STATUSES = ['open', 'assigned', 'submitted', 'in_review', 'approved', 'disputed', 'paid', 'cancelled']

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ gigId: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { gigId } = await params
  const body = await request.json()
  const { status, arbiter_ruling } = body

  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  await connectDB()

  const gig = await Gig.findById(gigId).lean()
  if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 })

  const update: Record<string, unknown> = {}
  if (status) update.status = status
  if (arbiter_ruling) update.arbiter_ruling = arbiter_ruling

  // Paying out: credit the assigned worker's wallet
  if (status === 'paid' && gig.assigned_to && gig.status !== 'paid') {
    const payout = gig.budget_naira - gig.platform_fee_naira
    await Promise.all([
      Profile.findByIdAndUpdate(gig.assigned_to, {
        $inc: { wallet_balance: payout, total_earned: payout },
      }),
      Transaction.create({
        user_id: gig.assigned_to,
        type: 'gig_earning',
        amount_naira: payout,
        status: 'completed',
        reference: `GIG-PAY-${gigId}-${Date.now()}`,
        description: `Gig payment: ${gig.title}`,
        metadata: { gig_id: gigId },
      }),
    ])
    update.paid_at = new Date()
  }

  if (status === 'approved') update.approved_at = new Date()

  const updated = await Gig.findByIdAndUpdate(gigId, { $set: update }, { new: true })
    .populate('client_id', 'full_name email')
    .populate('assigned_to', 'full_name email')
    .lean()

  return NextResponse.json({ gig: updated })
}
