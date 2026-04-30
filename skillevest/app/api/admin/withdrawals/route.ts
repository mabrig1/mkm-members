import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb/connection'
import { Withdrawal } from '@/lib/mongodb/models'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) return null
  if ((session.user as { role?: string }).role !== 'admin') return null
  return session
}

export async function GET(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = 25
  const skip = (page - 1) * limit

  await connectDB()

  const filter: Record<string, unknown> = {}
  if (status) filter.status = status

  const [withdrawals, total] = await Promise.all([
    Withdrawal.find(filter)
      .populate('user_id', 'full_name email')
      .sort({ requested_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Withdrawal.countDocuments(filter),
  ])

  return NextResponse.json({
    withdrawals,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}
