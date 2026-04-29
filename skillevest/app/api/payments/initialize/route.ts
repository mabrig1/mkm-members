import { NextRequest, NextResponse } from 'next/server'
import { initializePayment, generateReference } from '@/lib/paystack'
import { connectDB } from '@/lib/mongodb/connection'
import { Profile, Transaction } from '@/lib/mongodb/models'

export async function POST(request: NextRequest) {
  try {
    const { user_id, type, amount_naira, metadata } = await request.json()

    await connectDB()

    const profile = await Profile.findById(user_id).select('email full_name').lean()
    if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const reference = generateReference(type === 'subscription' ? 'SUB' : 'PAY')

    const paystackData = await initializePayment({
      email: profile.email,
      amount_naira,
      reference,
      metadata: { user_id, type, ...metadata },
    })

    await Transaction.create({
      user_id,
      type,
      amount_naira,
      status: 'pending',
      reference,
      description: metadata?.description || `Payment - ${type}`,
    })

    return NextResponse.json({
      authorization_url: paystackData.authorization_url,
      reference,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
