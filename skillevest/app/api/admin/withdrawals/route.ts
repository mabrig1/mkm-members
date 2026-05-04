import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb/connection'
import { Withdrawal, Profile, Transaction, Notification } from '@/lib/mongodb/models'
import { createTransferRecipient, initiateTransfer, generateReference } from '@/lib/paystack'

function adminGuard(session: Awaited<ReturnType<typeof getServerSession>>) {
  const role = (session?.user as { role?: string })?.role
  return !session || role !== 'admin'
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (adminGuard(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? 'pending'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = 30

  await connectDB()

  const [withdrawals, total] = await Promise.all([
    Withdrawal.find({ status })
      .populate('user_id', 'full_name email phone')
      .sort({ requested_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Withdrawal.countDocuments({ status }),
  ])

  return NextResponse.json({ withdrawals, total, page, pages: Math.ceil(total / limit) })
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (adminGuard(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { withdrawal_id, action, reject_reason } = await request.json()
  if (!withdrawal_id || !action) {
    return NextResponse.json({ error: 'withdrawal_id and action required' }, { status: 400 })
  }

  await connectDB()

  const withdrawal = await Withdrawal.findById(withdrawal_id).lean()
  if (!withdrawal) return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 })
  if (withdrawal.status !== 'pending') {
    return NextResponse.json({ error: 'Withdrawal is not pending' }, { status: 409 })
  }

  if (action === 'reject') {
    await Promise.all([
      Withdrawal.findByIdAndUpdate(withdrawal_id, {
        status: 'failed',
        failure_reason: reject_reason ?? 'Rejected by admin',
        processed_at: new Date(),
      }),
      Profile.findByIdAndUpdate(withdrawal.user_id, {
        $inc: { wallet_balance: withdrawal.amount_naira },
      }),
      Notification.create({
        user_id: withdrawal.user_id,
        title: '⚠️ Withdrawal Rejected',
        body: `Your withdrawal of ₦${withdrawal.amount_naira.toLocaleString('en-NG')} was rejected. ${reject_reason ?? ''} Your balance has been restored.`,
        type: 'payment',
        action_url: '/wallet',
      }),
    ])
    return NextResponse.json({ success: true })
  }

  if (action === 'approve') {
    await Withdrawal.findByIdAndUpdate(withdrawal_id, { status: 'processing' })

    try {
      const recipient = await createTransferRecipient(
        withdrawal.account_name,
        withdrawal.account_number,
        withdrawal.bank_name
      )

      const reference = generateReference('WD')
      const transfer = await initiateTransfer(
        withdrawal.amount_naira * 100,
        recipient.recipient_code,
        reference,
        `Withdrawal: ${withdrawal.account_name}`
      )

      await Promise.all([
        Withdrawal.findByIdAndUpdate(withdrawal_id, {
          status: 'completed',
          paystack_transfer_code: transfer.transfer_code,
          processed_at: new Date(),
        }),
        Transaction.create({
          user_id: withdrawal.user_id,
          type: 'withdrawal',
          amount_naira: withdrawal.amount_naira,
          status: 'completed',
          reference,
          description: `Withdrawal to ${withdrawal.bank_name} — ${withdrawal.account_number}`,
        }),
        Notification.create({
          user_id: withdrawal.user_id,
          title: '✅ Withdrawal Sent',
          body: `₦${withdrawal.amount_naira.toLocaleString('en-NG')} is on its way to your ${withdrawal.bank_name} account.`,
          type: 'payment',
          action_url: '/wallet',
        }),
      ])

      return NextResponse.json({ success: true, transfer_code: transfer.transfer_code })
    } catch (err) {
      await Promise.all([
        Withdrawal.findByIdAndUpdate(withdrawal_id, {
          status: 'failed',
          failure_reason: String(err),
          processed_at: new Date(),
        }),
        Profile.findByIdAndUpdate(withdrawal.user_id, {
          $inc: { wallet_balance: withdrawal.amount_naira },
        }),
      ])
      return NextResponse.json({ error: 'Transfer failed, balance restored' }, { status: 502 })
    }
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
