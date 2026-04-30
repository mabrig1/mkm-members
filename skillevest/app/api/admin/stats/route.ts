import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb/connection'
import { Profile, Gig, Withdrawal, Transaction, Enrollment } from '@/lib/mongodb/models'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) return null
  if ((session.user as { role?: string }).role !== 'admin') return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await connectDB()

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const [
    totalUsers,
    newUsersThisWeek,
    openGigs,
    pendingWithdrawals,
    totalWithdrawn,
    platformRevenue,
    activeEnrollments,
    roleBreakdown,
  ] = await Promise.all([
    Profile.countDocuments({ role: { $ne: 'admin' } }),
    Profile.countDocuments({ role: { $ne: 'admin' }, created_at: { $gte: weekStart } }),
    Gig.countDocuments({ status: 'open' }),
    Withdrawal.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$amount_naira' } } },
    ]),
    Transaction.aggregate([
      { $match: { type: 'withdrawal', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount_naira' } } },
    ]),
    Gig.aggregate([
      { $match: { status: { $in: ['approved', 'paid'] } } },
      { $group: { _id: null, total: { $sum: '$platform_fee_naira' } } },
    ]),
    Enrollment.countDocuments({ status: 'active' }),
    Profile.aggregate([
      { $match: { role: { $ne: 'admin' } } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]),
  ])

  return NextResponse.json({
    total_users: totalUsers,
    new_users_this_week: newUsersThisWeek,
    open_gigs: openGigs,
    pending_withdrawals: {
      count: pendingWithdrawals[0]?.count ?? 0,
      total_naira: pendingWithdrawals[0]?.total ?? 0,
    },
    total_withdrawn_naira: totalWithdrawn[0]?.total ?? 0,
    platform_revenue_naira: platformRevenue[0]?.total ?? 0,
    active_enrollments: activeEnrollments,
    role_breakdown: Object.fromEntries(
      (roleBreakdown as { _id: string; count: number }[]).map((r) => [r._id, r.count])
    ),
  })
}
