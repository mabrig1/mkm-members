import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb/connection'
import {
  Profile,
  Enrollment,
  UserTask,
  Gig,
  LeaderboardEntry,
  Transaction,
  Notification,
} from '@/lib/mongodb/models'

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function getWeekStart() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay()) // Sunday
  return d
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id?: string }).id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const profile = await Profile.findById(userId).lean()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const weekStart = getWeekStart()

  const [
    enrollment,
    tasksCompleted,
    gigsWon,
    todayTask,
    openGigs,
    weeklyTransactions,
    leaderboardEntries,
    globalRank,
    unreadCount,
  ] = await Promise.all([
    Enrollment.findOne({ user_id: userId, status: 'active' })
      .populate('track_id', 'title category duration_days slug')
      .lean(),
    UserTask.countDocuments({ user_id: userId, status: { $in: ['approved', 'graded'] } }),
    Gig.countDocuments({ assigned_to: userId, status: { $in: ['approved', 'paid'] } }),
    UserTask.findOne({ user_id: userId, submitted_at: { $gte: startOfToday() } }).lean(),
    Gig.find({ status: 'open' }).sort({ created_at: -1 }).limit(4).lean(),
    Transaction.find({
      user_id: userId,
      status: 'completed',
      type: { $in: ['gig_earning', 'bonus'] },
      created_at: { $gte: sevenDaysAgo },
    })
      .sort({ created_at: 1 })
      .lean(),
    LeaderboardEntry.find({ week_start: weekStart })
      .sort({ total_earned_naira: -1 })
      .limit(5)
      .populate('user_id', 'full_name university')
      .lean(),
    Profile.countDocuments({ total_earned: { $gt: profile.total_earned } }),
    Notification.countDocuments({ user_id: userId, is_read: false }),
  ])

  // Fallback leaderboard from profiles if no weekly entries yet
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let leaderboard: any[] = leaderboardEntries
  if (leaderboard.length === 0) {
    const topProfiles = await Profile.find({})
      .sort({ total_earned: -1 })
      .limit(5)
      .select('full_name university total_earned')
      .lean()
    leaderboard = topProfiles.map((p, i) => ({
      _id: p._id,
      user_id: p,
      total_earned_naira: p.total_earned,
      rank: i + 1,
      week_start: weekStart,
      gigs_completed: 0,
      tasks_completed: 0,
      xp_gained: 0,
      created_at: new Date(),
    }))
  }

  // Build sparkline: sum earnings per day for last 7 days
  const sparkline = Array.from({ length: 7 }, (_, i) => {
    const dayStart = new Date(sevenDaysAgo)
    dayStart.setDate(dayStart.getDate() + i)
    const dayEnd = new Date(dayStart)
    dayEnd.setHours(23, 59, 59, 999)
    return weeklyTransactions
      .filter((t) => {
        const d = new Date(t.created_at)
        return d >= dayStart && d <= dayEnd
      })
      .reduce((sum, t) => sum + t.amount_naira, 0)
  })

  const weeklyEarned = weeklyTransactions
    .filter((t) => new Date(t.created_at) >= weekStart)
    .reduce((sum, t) => sum + t.amount_naira, 0)

  return NextResponse.json({
    profile: {
      _id: profile._id.toString(),
      full_name: profile.full_name,
      role: profile.role,
      level: profile.level,
      xp_points: profile.xp_points,
      streak_days: profile.streak_days,
      wallet_balance: profile.wallet_balance,
      total_earned: profile.total_earned,
    },
    enrollment,
    stats: {
      tasks_completed: tasksCompleted,
      gigs_won: gigsWon,
      global_rank: globalRank + 1,
      weekly_earned: weeklyEarned,
    },
    today_task_done: !!todayTask,
    open_gigs: openGigs,
    leaderboard,
    sparkline,
    unread_notifications: unreadCount,
  })
}
