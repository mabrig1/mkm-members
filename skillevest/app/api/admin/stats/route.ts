import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb/connection'
import { Profile, Transaction, Gig, Withdrawal } from '@/lib/mongodb/models'

export async function GET() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string })?.role
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectDB()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [
    totalUsers,
    activeToday,
    monthlyVolume,
    platformFees,
    openGigs,
    pendingWithdrawals,
    pendingWithdrawalAmount,
  ] = await Promise.all([
    Profile.countDocuments({ role: { $ne: 'admin' } }),
    Profile.countDocuments({ last_active_date: { $gte: todayStart }, role: { $ne: 'admin' } }),
    Transaction.aggregate([
      { $match: { created_at: { $gte: monthStart }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount_naira' } } },
    ]),
    Transaction.aggregate([
      {
        $match: {
          created_at: { $gte: monthStart },
          status: 'completed',
          type: 'gig_earning',
        },
      },
      {
        $lookup: {
          from: 'gigs',
          localField: 'metadata.gig_id',
          foreignField: '_id',
          as: 'gig',
        },
      },
      { $unwind: { path: '$gig', preserveNullAndEmptyArrays: true } },
      { $group: { _id: null, total: { $sum: '$gig.platform_fee_naira' } } },
    ]),
    Gig.countDocuments({ status: 'open' }),
    Withdrawal.countDocuments({ status: 'pending' }),
    Withdrawal.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount_naira' } } },
    ]),
  ])

  return NextResponse.json({
    total_users: totalUsers,
    active_today: activeToday,
    monthly_volume: monthlyVolume[0]?.total ?? 0,
    platform_fees: platformFees[0]?.total ?? 0,
    open_gigs: openGigs,
    pending_withdrawals: pendingWithdrawals,
    pending_withdrawal_amount: pendingWithdrawalAmount[0]?.total ?? 0,
  })
}
