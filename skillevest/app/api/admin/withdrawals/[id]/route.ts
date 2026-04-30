import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb/connection'
import { Withdrawal, Profile, Transaction } from '@/lib/mongodb/models'
import { notifyWithdrawalCompleted } from '@/lib/whatsapp/reminders'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) return null
  if ((session.user as { role?: string }).role !== 'admin') return null
  return session
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { status, failure_reason } = await request.json()

  if (!['completed', 'failed', 'processing'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  await connectDB()

  const withdrawal = await Withdrawal.findById(id).lean()
  if (!withdrawal) return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 })
  if (withdrawal.status === 'completed') {
    return NextResponse.json({ error: 'Already completed' }, { status: 409 })
  }

  const update: Record<string, unknown> = { status }
  if (status === 'completed' || status === 'failed') update.processed_at = new Date()
  if (failure_reason) update.failure_reason = failure_reason

  // On failure: refund the user's wallet
  if (status === 'failed' && withdrawal.status !== 'failed') {
    await Promise.all([
      Profile.findByIdAndUpdate(withdrawal.user_id, {
        $inc: { wallet_balance: withdrawal.amount_naira },
      }),
      Transaction.create({
        user_id: withdrawal.user_id,
        type: 'refund',
        amount_naira: withdrawal.amount_naira,
        status: 'completed',
        reference: `REFUND-${id}-${Date.now()}`,
        description: `Withdrawal refunded: ${failure_reason ?? 'transfer failed'}`,
        metadata: { withdrawal_id: id },
      }),
    ])
  }

  // On completion: mark the matching transaction as completed
  if (status === 'completed') {
    await Transaction.findOneAndUpdate(
      { user_id: withdrawal.user_id, type: 'withdrawal', status: 'pending' },
      { $set: { status: 'completed' } }
    )
  }

  const updated = await Withdrawal.findByIdAndUpdate(id, { $set: update }, { new: true })
    .populate('user_id', 'full_name email')
    .lean()

  if (status === 'completed' || status === 'failed') {
    notifyWithdrawalCompleted(id, status, failure_reason).catch(() => {})
  }

  return NextResponse.json({ withdrawal: updated })
}
