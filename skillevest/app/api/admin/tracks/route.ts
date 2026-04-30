import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb/connection'
import { Track } from '@/lib/mongodb/models'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) return null
  if ((session.user as { role?: string }).role !== 'admin') return null
  return session
}

export async function GET(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') ?? ''
  const published = searchParams.get('published') ?? ''

  await connectDB()

  const filter: Record<string, unknown> = {}
  if (category) filter.category = category
  if (published === 'true') filter.is_published = true
  if (published === 'false') filter.is_published = false

  const tracks = await Track.find(filter).sort({ created_at: -1 }).lean()

  return NextResponse.json({ tracks })
}

export async function POST(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const {
    title, slug, category, description, full_description,
    duration_days, difficulty, is_premium, avg_earning_naira, tags,
  } = body

  if (!title || !slug || !category || !description || !duration_days) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  await connectDB()

  const existing = await Track.findOne({ slug }).lean()
  if (existing) return NextResponse.json({ error: 'Slug already in use' }, { status: 409 })

  const track = await Track.create({
    title,
    slug,
    category,
    description,
    full_description,
    duration_days,
    difficulty: difficulty ?? 'beginner',
    is_premium: is_premium ?? false,
    is_published: false,
    avg_earning_naira: avg_earning_naira ?? 0,
    tags: tags ?? [],
  })

  return NextResponse.json({ track }, { status: 201 })
}
