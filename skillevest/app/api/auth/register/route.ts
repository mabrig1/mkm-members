import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb/connection'
import Profile from '@/lib/mongodb/models/Profile'

export async function POST(request: NextRequest) {
  try {
    const { full_name, email, phone, whatsapp_number, university, state, password, referral_code } =
      await request.json()

    if (!full_name || !email || !phone || !university || !state || !password) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    await connectDB()

    const existing = await Profile.findOne({ email: email.toLowerCase() }).lean()
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    const existingPhone = await Profile.findOne({ phone }).lean()
    if (existingPhone) {
      return NextResponse.json({ error: 'This phone number is already registered' }, { status: 409 })
    }

    let referred_by = undefined
    if (referral_code) {
      const referrer = await Profile.findOne({
        referral_code: referral_code.toUpperCase(),
      }).lean()
      if (referrer) referred_by = referrer._id
    }

    const password_hash = await bcrypt.hash(password, 12)

    const profile = await Profile.create({
      full_name: full_name.trim(),
      email: email.toLowerCase().trim(),
      phone,
      whatsapp_number: whatsapp_number || phone,
      university,
      state,
      password_hash,
      referred_by,
    })

    return NextResponse.json({ success: true, user_id: profile._id.toString() }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
