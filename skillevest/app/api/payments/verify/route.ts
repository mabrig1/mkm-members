import { NextRequest, NextResponse } from 'next/server'
import { verifyPayment } from '@/lib/paystack'
import { connectDB } from '@/lib/mongodb/connection'
import { Transaction, Profile } from '@/lib/mongodb/models'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const reference = searchParams.get('reference')

  if (!reference) {
    return NextResponse.redirect(`${APP_URL}/dashboard?payment=failed`)
  }

  try {
    const paymentData = await verifyPayment(reference)

    if (paymentData.status !== 'success') {
      return NextResponse.redirect(`${APP_URL}/dashboard?payment=failed`)
    }

    const { user_id, type } = paymentData.metadata as { user_id: string; type: string }

    await connectDB()

    await Transaction.findOneAndUpdate(
      { reference },
      { status: 'completed', paystack_reference: paymentData.reference }
    )

    if (type === 'subscription') {
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 1)

      await Profile.findByIdAndUpdate(user_id, {
        is_premium: true,
        premium_expires_at: expiresAt,
      })
    }

    return NextResponse.redirect(`${APP_URL}/dashboard?payment=success`)
  } catch {
    return NextResponse.redirect(`${APP_URL}/dashboard?payment=error`)
  }
}
