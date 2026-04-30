import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb/connection'
import { Profile } from '@/lib/mongodb/models'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) return null
  if ((session.user as { role?: string }).role !== 'admin') return null
  return session
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId } = await params
  const body = await request.json()
  const { role, is_premium, wallet_adjustment, xp_points } = body

  await connectDB()

  const update: Record<string, unknown> = {}
  if (role) update.role = role
  if (typeof is_premium === 'boolean') {
    update.is_premium = is_premium
    if (is_premium) {
      update.premium_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  }
  if (typeof xp_points === 'number') update.xp_points = xp_points

  const updateOp: Record<string, unknown> = { $set: update }
  if (typeof wallet_adjustment === 'number' && wallet_adjustment !== 0) {
    updateOp.$inc = { wallet_balance: wallet_adjustment, total_earned: wallet_adjustment > 0 ? wallet_adjustment : 0 }
  }

  const updated = await Profile.findByIdAndUpdate(userId, updateOp, { new: true })
    .select('-password_hash')
    .lean()

  if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  return NextResponse.json({ user: updated })
}
