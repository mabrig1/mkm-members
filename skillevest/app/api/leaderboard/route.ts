import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb/connection'
import { Profile, LeaderboardEntry } from '@/lib/mongodb/models'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id?: string }).id!
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') ?? 'week' // week | month | all_time
  const category = searchParams.get('category') ?? '' // '' | copywriting | design | social_media | data_entry

  await connectDB()

  let entries: { user_id: { full_name: string; level: number; role: string; _id: unknown }; total_earned: number; rank?: number; prev_rank?: number }[] = []

  if (period === 'all_time') {
    const filter: Record<string, unknown> = {}
    if (category) filter.category = category

    const profiles = await Profile.find({ onboarding_completed: true })
      .select('full_name total_earned level role')
      .sort({ total_earned: -1 })
      .limit(100)
      .lean()

    entries = profiles.map((p, i) => ({
      user_id: { full_name: p.full_name, level: p.level ?? 1, role: p.role ?? 'novice', _id: p._id },
      total_earned: p.total_earned ?? 0,
      rank: i + 1,
    }))
  } else {
    const now = new Date()
    let periodStart: Date

    if (period === 'week') {
      const day = now.getDay()
      periodStart = new Date(now)
      periodStart.setDate(now.getDate() - day)
      periodStart.setHours(0, 0, 0, 0)
    } else {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const filter: Record<string, unknown> = { period_start: { $gte: periodStart } }
    if (category) filter.category = category

    const leaderboardEntries = await LeaderboardEntry.find(filter)
      .populate('user_id', 'full_name level role')
      .sort({ total_earned: -1 })
      .limit(100)
      .lean()

    if (leaderboardEntries.length === 0) {
      const profiles = await Profile.find({ onboarding_completed: true })
        .select('full_name total_earned level role')
        .sort({ total_earned: -1 })
        .limit(100)
        .lean()

      entries = profiles.map((p, i) => ({
        user_id: { full_name: p.full_name, level: p.level ?? 1, role: p.role ?? 'novice', _id: p._id },
        total_earned: p.total_earned ?? 0,
        rank: i + 1,
      }))
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      entries = leaderboardEntries.map((e: any, i: number) => ({
        user_id: e.user_id as { full_name: string; level: number; role: string; _id: unknown },
        total_earned: e.total_earned_naira ?? 0,
        rank: i + 1,
        prev_rank: e.prev_rank,
      }))
    }
  }

  const myRank = entries.findIndex((e) => e.user_id?._id?.toString() === userId)

  return NextResponse.json({
    entries,
    my_rank: myRank === -1 ? null : myRank + 1,
    my_entry: myRank === -1 ? null : entries[myRank],
  })
}
