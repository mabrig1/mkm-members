'use client'
import { useCallback, useEffect, useState } from 'react'
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react'

/* ─── types ─────────────────────────────────────────────────── */
interface Entry {
  user_id: { _id: string; full_name: string; level: number; role: string }
  total_earned: number
  rank: number
  prev_rank?: number
}

interface LeaderboardData {
  entries: Entry[]
  my_rank: number | null
  my_entry: Entry | null
}

/* ─── constants ─────────────────────────────────────────────── */
const PERIODS = [
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'All Time', value: 'all_time' },
]

const CATEGORIES = [
  { label: 'Overall', value: '' },
  { label: 'Copywriting', value: 'copywriting' },
  { label: 'Design', value: 'design' },
  { label: 'Social Media', value: 'social_media' },
]

const ROLE_BADGE: Record<string, string> = {
  novice:     'bg-zinc-800 text-zinc-400',
  apprentice: 'bg-blue-400/10 text-blue-400',
  pro:        'bg-purple-400/10 text-purple-400',
  mentor:     'bg-[#F5A623]/10 text-[#F5A623]',
}

/* ─── helpers ───────────────────────────────────────────────── */
function fmt(n: number) { return `₦${n.toLocaleString('en-NG')}` }

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function rankChange(entry: Entry) {
  if (entry.prev_rank == null) return null
  const diff = entry.prev_rank - entry.rank
  if (diff > 0) return { dir: 'up', n: diff }
  if (diff < 0) return { dir: 'down', n: Math.abs(diff) }
  return { dir: 'same', n: 0 }
}

/* ─── podium card ────────────────────────────────────────────── */
function PodiumCard({ entry, pos }: { entry: Entry; pos: 1 | 2 | 3 }) {
  const colors = {
    1: { ring: 'ring-[#F5A623]', bg: 'bg-[#F5A623]/10', text: 'text-[#F5A623]', size: 'w-16 h-16 text-xl', order: 'order-2' },
    2: { ring: 'ring-zinc-400', bg: 'bg-zinc-400/10', text: 'text-zinc-400', size: 'w-12 h-12 text-base', order: 'order-1' },
    3: { ring: 'ring-orange-700', bg: 'bg-orange-700/10', text: 'text-orange-700', size: 'w-12 h-12 text-base', order: 'order-3' },
  }[pos]

  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' }

  return (
    <div className={`flex flex-col items-center gap-1 ${colors.order}`}>
      <div className={`${colors.size} rounded-full ${colors.bg} ring-2 ${colors.ring} flex items-center justify-center font-black ${colors.text}`}>
        {initials(entry.user_id.full_name)}
      </div>
      <span className="text-base">{medals[pos]}</span>
      <p className="text-white font-bold text-xs text-center line-clamp-1 max-w-[72px]">
        {entry.user_id.full_name.split(' ')[0]}
      </p>
      <p className="text-[#F5A623] font-black text-xs">{fmt(entry.total_earned)}</p>
      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${ROLE_BADGE[entry.user_id.role] ?? ROLE_BADGE.novice}`}>
        {entry.user_id.role}
      </span>
    </div>
  )
}

/* ─── rank row ───────────────────────────────────────────────── */
function RankRow({ entry, isMe }: { entry: Entry; isMe: boolean }) {
  const change = rankChange(entry)
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isMe ? 'bg-[#F5A623]/5 border border-[#F5A623]/20' : 'bg-[#111111] border border-zinc-800/50 hover:border-zinc-700'}`}>
      <span className={`w-7 text-center font-black text-sm ${isMe ? 'text-[#F5A623]' : 'text-zinc-400'}`}>
        #{entry.rank}
      </span>

      <div className={`w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center font-black text-xs ${isMe ? 'text-[#F5A623]' : 'text-zinc-300'}`}>
        {initials(entry.user_id.full_name)}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`font-bold text-sm truncate ${isMe ? 'text-[#F5A623]' : 'text-white'}`}>
          {entry.user_id.full_name}{isMe ? ' (You)' : ''}
        </p>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${ROLE_BADGE[entry.user_id.role] ?? ROLE_BADGE.novice}`}>
          {entry.user_id.role}
        </span>
      </div>

      <div className="text-right">
        <p className="text-white font-black text-sm">{fmt(entry.total_earned)}</p>
        {change && (
          <div className="flex items-center justify-end gap-0.5 mt-0.5">
            {change.dir === 'up' && <TrendingUp size={10} className="text-green-400" />}
            {change.dir === 'down' && <TrendingDown size={10} className="text-red-400" />}
            {change.dir === 'same' && <Minus size={10} className="text-zinc-600" />}
            {change.dir !== 'same' && (
              <span className={`text-[10px] font-semibold ${change.dir === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {change.n}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── skeleton ──────────────────────────────────────────────── */
function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[#111111] border border-zinc-800/50 rounded-xl animate-pulse">
      <div className="w-7 h-4 bg-zinc-800 rounded" />
      <div className="w-9 h-9 rounded-full bg-zinc-800" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-zinc-800 rounded w-24" />
        <div className="h-2 bg-zinc-800 rounded w-14" />
      </div>
      <div className="h-4 bg-zinc-800 rounded w-16" />
    </div>
  )
}

/* ─── main page ─────────────────────────────────────────────── */
export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('week')
  const [category, setCategory] = useState('')
  const userId = '' // will be populated by session — entries check via my_rank

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ period })
    if (category) params.set('category', category)
    const res = await fetch(`/api/leaderboard?${params}`)
    const d = await res.json()
    setData(d)
    setLoading(false)
  }, [period, category])

  useEffect(() => { fetchLeaderboard() }, [fetchLeaderboard])

  const top3 = data?.entries.slice(0, 3) ?? []
  const rest = data?.entries.slice(3) ?? []
  const myRank = data?.my_rank

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-32">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <Trophy size={24} className="text-[#F5A623]" />
          <h1 className="text-white text-2xl font-black">Leaderboard</h1>
        </div>
        <p className="text-zinc-500 text-sm">Top earners on SkillVest</p>
      </div>

      {/* Period tabs */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
        {PERIODS.map(p => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-full transition-colors ${
              period === p.value
                ? 'bg-[#F5A623] text-black'
                : 'bg-[#111111] border border-zinc-800 text-zinc-400 hover:border-zinc-600'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`flex-shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors ${
              category === c.value
                ? 'bg-zinc-700 text-white'
                : 'bg-[#111111] border border-zinc-800 text-zinc-500 hover:border-zinc-600'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <>
          {/* Podium skeleton */}
          <div className="flex justify-center items-end gap-6 px-4 py-6">
            {[2, 1, 3].map(n => (
              <div key={n} className="flex flex-col items-center gap-2">
                <div className={`rounded-full bg-zinc-800 animate-pulse ${n === 1 ? 'w-16 h-16' : 'w-12 h-12'}`} />
                <div className="h-3 bg-zinc-800 rounded w-12 animate-pulse" />
                <div className="h-3 bg-zinc-800 rounded w-14 animate-pulse" />
              </div>
            ))}
          </div>
          <div className="px-4 space-y-2">
            {Array.from({ length: 7 }).map((_, i) => <RowSkeleton key={i} />)}
          </div>
        </>
      ) : (
        <>
          {/* Podium — top 3 */}
          {top3.length >= 3 && (
            <div className="flex justify-center items-end gap-8 px-4 py-4 mb-2">
              <PodiumCard entry={top3[1]} pos={2} />
              <PodiumCard entry={top3[0]} pos={1} />
              <PodiumCard entry={top3[2]} pos={3} />
            </div>
          )}

          {/* 4th+ */}
          {rest.length > 0 && (
            <div className="px-4 space-y-2 mb-4">
              {rest.map(entry => (
                <RankRow
                  key={entry.user_id._id}
                  entry={entry}
                  isMe={entry.rank === myRank}
                />
              ))}
            </div>
          )}

          {data?.entries.length === 0 && (
            <div className="text-center py-16 px-4">
              <Trophy size={32} className="text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm">No data for this period yet</p>
              <p className="text-zinc-600 text-xs mt-1">Complete gigs to appear here</p>
            </div>
          )}
        </>
      )}

      {/* Sticky "Your Rank" */}
      {!loading && myRank && data?.my_entry && (
        <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 z-30">
          <div className="bg-[#0A0A0A] border border-[#F5A623]/30 rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-1 py-1">
              <RankRow entry={data.my_entry} isMe />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
