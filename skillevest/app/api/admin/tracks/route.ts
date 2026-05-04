import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb/connection'
import { Track, Task } from '@/lib/mongodb/models'

function adminGuard(session: Awaited<ReturnType<typeof getServerSession>>) {
  const role = (session?.user as { role?: string })?.role
  return !session || role !== 'admin'
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (adminGuard(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await connectDB()

  const tracks = await Track.find({}).sort({ created_at: -1 }).lean()

  const withTaskCounts = await Promise.all(
    tracks.map(async (t) => ({
      ...t,
      task_count: await Task.countDocuments({ track_id: t._id }),
    }))
  )

  return NextResponse.json({ tracks: withTaskCounts })
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (adminGuard(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { track_id, action } = await request.json()
  if (!track_id || !action) return NextResponse.json({ error: 'track_id and action required' }, { status: 400 })

  await connectDB()

  if (action === 'publish') {
    await Track.findByIdAndUpdate(track_id, { is_published: true })
    return NextResponse.json({ success: true })
  }

  if (action === 'unpublish') {
    await Track.findByIdAndUpdate(track_id, { is_published: false })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
