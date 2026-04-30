'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, TrendingUp, Star, Zap, Filter } from 'lucide-react'

/* ─── types ─────────────────────────────────────────────────── */
interface Gig {
  _id: string
  title: string
  description: string
  category: string
  budget_naira: number
  deadline_hours: number
  status: string
  min_level: string
  escrow_held: boolean
  client_id: { full_name: string; role: string }
  created_at: string
}

/* ─── constants ─────────────────────────────────────────────── */
const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Copywriting', value: 'copywriting' },
  { label: 'Design', value: 'design' },
  { label: 'Social Media', value: 'social_media' },
  { label: 'Data Entry', value: 'data_entry' },
  { label: 'Affiliate', value: 'affiliate' },
]

const SORTS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Highest Pay', value: 'highest_pay' },
  { label: 'Ending Soon', value: 'ending_soon' },
]

const CAT_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  copywriting:  { bg: 'bg-blue-400/10',   text: 'text-blue-400',   dot: 'bg-blue-400' },
  design:       { bg: 'bg-purple-400/10', text: 'text-purple-400', dot: 'bg-purple-400' },
  social_media: { bg: 'bg-pink-400/10',   text: 'text-pink-400',   dot: 'bg-pink-400' },
  data_entry:   { bg: 'bg-zinc-800',      text: 'text-zinc-400',   dot: 'bg-zinc-400' },
  affiliate:    { bg: 'bg-green-400/10',  text: 'text-green-400',  dot: 'bg-green-400' },
  video:        { bg: 'bg-red-400/10',    text: 'text-red-400',    dot: 'bg-red-400' },
}

const LEVEL_COLOR: Record<string, string> = {
  novice:     'text-zinc-400 bg-zinc-800',
  apprentice: 'text-blue-400 bg-blue-400/10',
  pro:        'text-purple-400 bg-purple-400/10',
  mentor:     'text-[#F5A623] bg-[#F5A623]/10',
}

/* ─── helpers ───────────────────────────────────────────────── */
function fmt(n: number) { return `₦${n.toLocaleString('en-NG')}` }

function computeDeadline(createdAt: string, deadlineHours: number) {
  return new Date(createdAt).getTime() + deadlineHours * 3_600_000
}

function formatTimeLeft(deadlineTs: number): { label: string; urgent: boolean; critical: boolean } {
  const diff = deadlineTs - Date.now()
  if (diff <= 0) return { label: 'Expired', urgent: true, critical: true }
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  const critical = h < 6
  const urgent = h < 24
  if (h >= 48) return { label: `${Math.floor(h / 24)}d ${h % 24}h`, urgent: false, critical: false }
  if (h > 0) return { label: `${h}h ${m}m`, urgent, critical }
  return { label: `${m}m`, urgent: true, critical: true }
}

/* ─── countdown hook ────────────────────────────────────────── */
function useCountdown(createdAt: string, deadlineHours: number) {
  const ts = computeDeadline(createdAt, deadlineHours)
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])
  return formatTimeLeft(ts)
}

/* ─── skeleton ──────────────────────────────────────────────── */
function CardSkeleton() {
  return (
    <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 animate-pulse space-y-3">
      <div className="flex justify-between"><div className="h-4 bg-zinc-800 rounded w-20" /><div className="h-4 bg-zinc-800 rounded w-16" /></div>
      <div className="h-5 bg-zinc-800 rounded w-3/4" />
      <div className="h-3 bg-zinc-800 rounded w-full" />
      <div className="h-3 bg-zinc-800 rounded w-2/3" />
      <div className="flex justify-between items-center pt-1">
        <div className="h-6 bg-zinc-800 rounded w-20" />
        <div className="h-10 bg-zinc-800 rounded-xl w-24" />
      </div>
    </div>
  )
}

/* ─── gig card ──────────────────────────────────────────────── */
function GigCard({ gig }: { gig: Gig }) {
  const cat = CAT_COLOR[gig.category] ?? CAT_COLOR.data_entry
  const { label: timeLabel, urgent, critical } = useCountdown(gig.created_at, gig.deadline_hours)

  return (
    <div className="bg-[#111111] border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 flex flex-col gap-3 transition-colors">
      {/* Top row */}
      <div className="flex items-center justify-between gap-2">
        <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${cat.bg} ${cat.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
          {gig.category.replace('_', ' ')}
        </span>
        {gig.escrow_held && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-[#F5A623] bg-[#F5A623]/10 px-2 py-1 rounded-full">
            🛡 Escrow
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-white font-bold text-sm leading-snug line-clamp-2">{gig.title}</h3>

      {/* Description */}
      <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2">{gig.description}</p>

      {/* Meta row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${LEVEL_COLOR[gig.min_level] ?? LEVEL_COLOR.novice}`}>
          {gig.min_level}+
        </span>
        {gig.client_id && (
          <span className="flex items-center gap-1 text-zinc-600 text-[10px]">
            <Star size={9} className="text-[#F5A623] fill-[#F5A623]" /> {gig.client_id.full_name.split(' ')[0]}
          </span>
        )}
      </div>

      {/* Budget + deadline + CTA */}
      <div className="flex items-center justify-between gap-3 pt-1 border-t border-zinc-800/60 mt-auto">
        <div>
          <p className="text-[#F5A623] font-black text-lg leading-none">{fmt(gig.budget_naira)}</p>
          <div className={`flex items-center gap-1 mt-1 text-[10px] font-semibold ${critical ? 'text-red-400' : urgent ? 'text-yellow-400' : 'text-zinc-500'}`}>
            <Clock size={10} />
            <span>Closes in {timeLabel}</span>
          </div>
        </div>
        <Link
          href={`/gigs/${gig._id}`}
          className="flex-shrink-0 bg-[#F5A623] hover:bg-[#e09610] text-black font-bold text-xs rounded-xl px-4 py-2.5 transition-colors"
        >
          View Gig
        </Link>
      </div>
    </div>
  )
}

/* ─── main page ─────────────────────────────────────────────── */
export default function GigsPage() {
  const [gigs, setGigs] = useState<Gig[]>([])
  const [totalOpen, setTotalOpen] = useState(0)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('newest')
  const [showSort, setShowSort] = useState(false)

  const fetchGigs = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ sort })
    if (category) params.set('category', category)
    const res = await fetch(`/api/gigs?${params}`)
    const data = await res.json()
    setGigs(data.gigs ?? [])
    setTotalOpen(data.totalOpen ?? 0)
    setLoading(false)
  }, [category, sort])

  useEffect(() => { fetchGigs() }, [fetchGigs])

  const sortLabel = SORTS.find((s) => s.value === sort)?.label ?? 'Newest'

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-2">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-white text-2xl font-black">Gig Marketplace</h1>
          <span className="bg-[#F5A623] text-black text-xs font-black px-2.5 py-1 rounded-full">
            {totalOpen} open
          </span>
        </div>
        <p className="text-zinc-500 text-sm">Apply, deliver, get paid. All work escrow-protected.</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 px-4 pt-3 pb-2 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-full transition-colors ${
              category === c.value
                ? 'bg-[#F5A623] text-black'
                : 'bg-[#111111] border border-zinc-800 text-zinc-400 hover:border-zinc-600'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Sort bar */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <p className="text-zinc-600 text-xs">
          {loading ? '—' : `${gigs.length} gig${gigs.length !== 1 ? 's' : ''}`}
          {category ? ` in ${category.replace('_', ' ')}` : ''}
        </p>
        <div className="relative">
          <button
            onClick={() => setShowSort((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 bg-[#111111] border border-zinc-800 rounded-lg px-3 py-2 hover:border-zinc-600 transition-colors"
          >
            <Filter size={12} /> {sortLabel}
          </button>
          {showSort && (
            <div className="absolute right-0 top-9 bg-[#111111] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl z-20 min-w-[140px]">
              {SORTS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => { setSort(s.value); setShowSort(false) }}
                  className={`w-full text-left px-4 py-3 text-xs font-semibold transition-colors ${
                    sort === s.value ? 'text-[#F5A623] bg-[#F5A623]/5' : 'text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {s.value === 'ending_soon' && <span className="mr-1.5">🔥</span>}
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="px-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : gigs.length === 0 ? (
          <div className="text-center py-16">
            <Zap size={32} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">No open gigs right now.</p>
            <p className="text-zinc-600 text-xs mt-1">Check back soon — new gigs post daily.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {gigs.map((g) => <GigCard key={g._id} gig={g} />)}
          </div>
        )}
      </div>
    </div>
  )
}
