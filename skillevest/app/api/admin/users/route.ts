import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb/connection'
import { Profile } from '@/lib/mongodb/models'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') ?? ''
  const role = searchParams.get('role') ?? ''
  const level = searchParams.get('level') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = 50

  await connectDB()

  const filter: Record<string, unknown> = { role: { $ne: 'admin' } }
  if (q) {
    filter.$or = [
      { full_name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ]
  }
  if (role) filter.role = role
  if (level) filter.level = parseInt(level)

  const [users, total] = await Promise.all([
    Profile.find(filter)
      .select('-password_hash')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Profile.countDocuments(filter),
  ])

  return NextResponse.json({ users, total, page, pages: Math.ceil(total / limit) })
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { user_id, action, role } = await request.json()
  if (!user_id || !action) return NextResponse.json({ error: 'user_id and action required' }, { status: 400 })

  await connectDB()

  if (action === 'change_role' && role) {
    await Profile.findByIdAndUpdate(user_id, { role })
    return NextResponse.json({ success: true })
  }

  if (action === 'suspend') {
    await Profile.findByIdAndUpdate(user_id, { suspended: true })
    return NextResponse.json({ success: true })
  }

  if (action === 'unsuspend') {
    await Profile.findByIdAndUpdate(user_id, { suspended: false })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
