import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb/connection'
import { Gig } from '@/lib/mongodb/models'

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
  const category = searchParams.get('category') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = 25
  const skip = (page - 1) * limit

  await connectDB()

  const filter: Record<string, unknown> = {}
  if (status) filter.status = status
  if (category) filter.category = category

  const [gigs, total] = await Promise.all([
    Gig.find(filter)
      .populate('client_id', 'full_name email')
      .populate('assigned_to', 'full_name email')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Gig.countDocuments(filter),
  ])

  return NextResponse.json({
    gigs,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}
