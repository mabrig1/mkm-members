import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb/connection'
import { Track, Enrollment } from '@/lib/mongodb/models'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id?: string }).id!
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const premium = searchParams.get('premium')
  const search = searchParams.get('search')

  await connectDB()

  const filter: Record<string, unknown> = { is_published: true }
  if (category) filter.category = category
  if (premium === 'true') filter.is_premium = true
  if (premium === 'false') filter.is_premium = false
  if (search) filter.title = { $regex: search, $options: 'i' }

  const [tracks, enrollments] = await Promise.all([
    Track.find(filter).sort({ enrolled_count: -1 }).lean(),
    Enrollment.find({ user_id: userId }).lean(),
  ])

  const enrollmentMap = new Map(enrollments.map((e) => [e.track_id.toString(), e]))

  const result = tracks.map((t) => {
    const enrollment = enrollmentMap.get(t._id.toString())
    return {
      ...t,
      _id: t._id.toString(),
      enrollment: enrollment
        ? { status: enrollment.status, current_day: enrollment.current_day, progress_percentage: enrollment.progress_percentage }
        : null,
    }
  })

  return NextResponse.json({ tracks: result })
}
