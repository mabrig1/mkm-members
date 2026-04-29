import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb/connection'
import { Gig } from '@/lib/mongodb/models'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const sort = searchParams.get('sort') ?? 'newest'

  await connectDB()

  const filter: Record<string, unknown> = { status: 'open' }
  if (category) filter.category = category

  let query = Gig.find(filter).populate('client_id', 'full_name role created_at')

  if (sort === 'highest_pay') {
    query = query.sort({ budget_naira: -1 })
  } else if (sort === 'ending_soon') {
    // Computed field: created_at + deadline_hours — use aggregation proxy
    query = query.sort({ deadline_hours: 1, created_at: 1 })
  } else {
    query = query.sort({ created_at: -1 })
  }

  const [gigs, totalOpen] = await Promise.all([
    query.limit(50).lean(),
    Gig.countDocuments({ status: 'open' }),
  ])

  return NextResponse.json({ gigs, totalOpen })
}
