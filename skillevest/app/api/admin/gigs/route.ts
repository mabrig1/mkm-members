import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb/connection'
import { Gig, Profile, Transaction, Notification } from '@/lib/mongodb/models'
import { generateReference } from '@/lib/paystack'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = 30

  await connectDB()

  const filter: Record<string, unknown> = {}
  if (status) filter.status = status

  const [gigs, total] = await Promise.all([
    Gig.find(filter)
      .populate('client_id', 'full_name email')
      .populate('assigned_to', 'full_name email')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Gig.countDocuments(filter),
  ])

  return NextResponse.json({ gigs, total, page, pages: Math.ceil(total / limit) })
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { gig_id, action } = await request.json()
  if (!gig_id || !action) return NextResponse.json({ error: 'gig_id and action required' }, { status: 400 })

  await connectDB()

  if (action === 'publish') {
    await Gig.findByIdAndUpdate(gig_id, { status: 'open' })
    return NextResponse.json({ success: true })
  }

  if (action === 'close') {
    await Gig.findByIdAndUpdate(gig_id, { status: 'closed' })
    return NextResponse.json({ success: true })
  }

  if (action === 'release_escrow') {
    const gig = await Gig.findById(gig_id).lean()
    if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 })
    if (gig.status !== 'submitted') {
      return NextResponse.json({ error: 'Gig must be in submitted status' }, { status: 409 })
    }
    if (!gig.assigned_to) {
      return NextResponse.json({ error: 'No worker assigned' }, { status: 400 })
    }

    const workerEarning = gig.budget_naira - (gig.platform_fee_naira ?? 0)
    const workerId = gig.assigned_to.toString()
    const reference = generateReference('ADMIN_ESCROW')

    await Promise.all([
      Gig.findByIdAndUpdate(gig_id, { status: 'approved', approved_at: new Date() }),
      Profile.findByIdAndUpdate(workerId, {
        $inc: { wallet_balance: workerEarning, total_earned: workerEarning },
      }),
      Transaction.create({
        user_id: gig.assigned_to,
        type: 'gig_earning',
        amount_naira: workerEarning,
        status: 'completed',
        reference,
        description: `Admin escrow release: ${gig.title}`,
        metadata: { gig_id, admin_release: true },
      }),
      Notification.create({
        user_id: gig.assigned_to,
        title: '💰 Payment Released by Admin',
        body: `₦${workerEarning.toLocaleString('en-NG')} released for "${gig.title}".`,
        type: 'payment',
        action_url: '/wallet',
      }),
    ])

    return NextResponse.json({ success: true, amount_released: workerEarning })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
