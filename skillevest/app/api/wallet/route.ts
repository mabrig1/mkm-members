import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb/connection'
import { Profile, Transaction } from '@/lib/mongodb/models'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id?: string }).id!
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = 20
  const type = searchParams.get('type') ?? '' // all | gig_earning | withdrawal | subscription

  await connectDB()

  const filter: Record<string, unknown> = { user_id: userId }
  if (type && type !== 'all') filter.type = type

  const [profile, transactions, total] = await Promise.all([
    Profile.findById(userId).select('wallet_balance total_earned is_premium premium_expires_at').lean(),
    Transaction.find(filter)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Transaction.countDocuments(filter),
  ])

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  return NextResponse.json({
    wallet_balance: profile.wallet_balance ?? 0,
    total_earned: profile.total_earned ?? 0,
    is_premium: profile.is_premium ?? false,
    premium_expires_at: profile.premium_expires_at ?? null,
    transactions,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}
