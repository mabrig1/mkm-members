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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { trackId } = await params
  const body = await request.json()

  const allowed = [
    'title', 'description', 'full_description', 'is_published',
    'is_premium', 'difficulty', 'avg_earning_naira', 'tags',
  ]
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  await connectDB()

  const track = await Track.findByIdAndUpdate(trackId, { $set: update }, { new: true }).lean()
  if (!track) return NextResponse.json({ error: 'Track not found' }, { status: 404 })

  return NextResponse.json({ track })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { trackId } = await params
  await connectDB()

  const track = await Track.findByIdAndDelete(trackId).lean()
  if (!track) return NextResponse.json({ error: 'Track not found' }, { status: 404 })

  return NextResponse.json({ success: true })
}
