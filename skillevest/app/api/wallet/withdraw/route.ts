import { NextRequest, NextResponse } from 'next/server'
import { createTransferRecipient, initiateTransfer, generateReference } from '@/lib/paystack'
import { connectDB } from '@/lib/mongodb/connection'
import { Profile, Withdrawal, Transaction } from '@/lib/mongodb/models'

const MIN_WITHDRAWAL = 2000 // ₦2,000 minimum

export async function POST(request: NextRequest) {
  try {
    const { user_id, amount_naira, bank_name, account_number, account_name, bank_code } =
      await request.json()

    if (amount_naira < MIN_WITHDRAWAL) {
      return NextResponse.json(
        { error: `Minimum withdrawal is ₦${MIN_WITHDRAWAL.toLocaleString()}` },
        { status: 400 }
      )
    }

    await connectDB()

    const profile = await Profile.findById(user_id).select('wallet_balance full_name').lean()

    if (!profile || profile.wallet_balance < amount_naira) {
      return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 })
    }

    const recipient = await createTransferRecipient({ name: account_name, account_number, bank_code })

    const reference = generateReference('WDR')

    // Deduct from wallet before initiating transfer to prevent double-spend
    await Profile.findByIdAndUpdate(user_id, {
      $inc: { wallet_balance: -amount_naira },
    })

    await Withdrawal.create({
      user_id,
      amount_naira,
      bank_name,
      account_number,
      account_name,
      status: 'processing',
      paystack_transfer_code: recipient.recipient_code,
      requested_at: new Date(),
    })

    await Transaction.create({
      user_id,
      type: 'withdrawal',
      amount_naira,
      status: 'pending',
      reference,
      description: `Withdrawal to ${bank_name} - ${account_number.slice(-4)}`,
    })

    const transfer = await initiateTransfer({
      amount_naira,
      recipient_code: recipient.recipient_code,
      reference,
      reason: `SkillVest earnings withdrawal - ${profile.full_name}`,
    })

    return NextResponse.json({ success: true, transfer_code: transfer.transfer_code })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
