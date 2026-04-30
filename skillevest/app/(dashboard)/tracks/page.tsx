'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, Lock, Clock, Users, TrendingUp, CheckCircle2, Loader2 } from 'lucide-react'

/* ─── types ─────────────────────────────────────────────────── */
interface TrackEnrollment { status: string; current_day: number; progress_percentage: number }
interface Track {
  _id: string
  title: string
  slug: string
  category: string
  description: string
  duration_days: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  is_premium: boolean
  avg_earning_naira: number
  enrolled_count: number
  completion_rate: number
  enrollment: TrackEnrollment | null
}

/* ─── constants ─────────────────────────────────────────────── */
const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Free', value: 'free' },
  { label: 'Premium', value: 'premium' },
  { label: 'Copywriting', value: 'copywriting' },
  { label: 'Design', value: 'design' },
  { label: 'Social Media', value: 'social_media' },
]

const CAT_GRADIENT: Record<string, string> = {
  copywriting: 'from-blue-600 to-violet-700',
  design: 'from-pink-600 to-purple-700',
  video: 'from-red-600 to-orange-600',
  social_media: 'from-pink-500 to-rose-600',
  affiliate: 'from-green-600 to-teal-600',
  data_entry: 'from-zinc-600 to-slate-700',
}

const CAT_BADGE: Record<string, string> = {
  copywriting: 'text-blue-400 bg-blue-400/10',
  design: 'text-purple-400 bg-purple-400/10',
  video: 'text-red-400 bg-red-400/10',
  social_media: 'text-pink-400 bg-pink-400/10',
  affiliate: 'text-green-400 bg-green-400/10',
  data_entry: 'text-zinc-400 bg-zinc-800',
}

const DIFF_BADGE: Record<string, string> = {
  beginner: 'text-emerald-400 bg-emerald-400/10',
  intermediate: 'text-yellow-400 bg-yellow-400/10',
  advanced: 'text-red-400 bg-red-400/10',
}

function fmt(n: number) {
  return `₦${n.toLocaleString('en-NG')}`
}

/* ─── skeleton ──────────────────────────────────────────────── */
function CardSkeleton() {
  return (
    <div className="bg-[#111111] border border-zinc-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-32 bg-zinc-800" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-zinc-800 rounded w-20" />
        <div className="h-4 bg-zinc-800 rounded w-3/4" />
        <div className="h-3 bg-zinc-800 rounded w-1/2" />
        <div className="h-10 bg-zinc-800 rounded-xl mt-3" />
      </div>
    </div>
  )
}

/* ─── track card ────────────────────────────────────────────── */
function TrackCard({ track, onEnroll }: { track: Track; onEnroll: (id: string) => void }) {
  const [enrolling, setEnrolling] = useState(false)
  const enrollment = track.enrollment
  const gradient = CAT_GRADIENT[track.category] ?? CAT_GRADIENT.data_entry

  const handleEnroll = async () => {
    setEnrolling(true)
    await onEnroll(track._id)
    setEnrolling(false)
  }

  const CTA = () => {
    if (enrollment?.status === 'completed') {
      return (
        <div className="flex items-center justify-center gap-2 w-full bg-zinc-800 text-zinc-400 font-bold rounded-xl py-3 text-sm">
          <CheckCircle2 size={15} /> Completed
        </div>
      )
    }
    if (enrollment?.status === 'active') {
      return (
        <Link
          href={`/tracks/${track._id}`}
          className="flex items-center justify-center gap-2 w-full bg-[#F5A623] text-black font-bold rounded-xl py-3 text-sm"
        >
          Continue — Day {enrollment.current_day}
        </Link>
      )
    }
    return (
      <button
        onClick={handleEnroll}
        disabled={enrolling}
        className="flex items-center justify-center gap-2 w-full bg-[#F5A623] hover:bg-[#e09610] text-black font-bold rounded-xl py-3 text-sm transition-colors disabled:opacity-60"
      >
        {enrolling ? <Loader2 size={14} className="animate-spin" /> : null}
        {enrolling ? 'Enrolling…' : track.is_premium ? '🔒 Enroll (Premium)' : 'Enroll Free'}
      </button>
    )
  }

  return (
    <div className="bg-[#111111] border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
      {/* Thumbnail */}
      <div className={`h-28 bg-gradient-to-br ${gradient} flex items-end p-3 relative`}>
        {track.is_premium && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
            <Lock size={11} className="text-[#F5A623]" />
            <span className="text-[#F5A623] text-[10px] font-bold">PRO</span>
          </div>
        )}
        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm ${CAT_BADGE[track.category]}`}>
          {track.category.replace('_', ' ')}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-white font-bold text-sm leading-snug line-clamp-2 flex-1">{track.title}</h3>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${DIFF_BADGE[track.difficulty]}`}>
            {track.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-3 text-zinc-500 text-xs mb-3 mt-1">
          <span className="flex items-center gap-1"><Clock size={11} /> {track.duration_days}d</span>
          <span className="flex items-center gap-1"><Users size={11} /> {track.enrolled_count.toLocaleString()}</span>
          <span className="flex items-center gap-1 text-[#F5A623]"><TrendingUp size={11} /> {fmt(track.avg_earning_naira)}/mo</span>
        </div>

        {enrollment?.status === 'active' && (
          <div className="mb-3">
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F5A623] rounded-full"
                style={{ width: `${enrollment.progress_percentage}%` }}
              />
            </div>
            <p className="text-zinc-600 text-[10px] mt-1">
              {Math.round(enrollment.progress_percentage)}% complete
            </p>
          </div>
        )}

        <div className="mt-auto">
          <CTA />
        </div>
      </div>
    </div>
  )
}

/* ─── main page ─────────────────────────────────────────────── */
export default function TracksPage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('')
  const [search, setSearch] = useState('')

  const fetchTracks = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (activeFilter === 'free') params.set('premium', 'false')
    else if (activeFilter === 'premium') params.set('premium', 'true')
    else if (activeFilter) params.set('category', activeFilter)

    const res = await fetch(`/api/tracks?${params}`)
    const data = await res.json()
    setTracks(data.tracks ?? [])
    setLoading(false)
  }, [activeFilter])

  useEffect(() => { fetchTracks() }, [fetchTracks])

  const handleEnroll = async (trackId: string) => {
    // Optimistic update
    setTracks((prev) =>
      prev.map((t) =>
        t._id === trackId
          ? { ...t, enrollment: { status: 'active', current_day: 1, progress_percentage: 0 } }
          : t
      )
    )
    await fetch('/api/tracks/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ track_id: trackId }),
    })
  }

  const displayed = tracks.filter((t) =>
    search ? t.title.toLowerCase().includes(search.toLowerCase()) : true
  )

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-white text-2xl font-black mb-1">Skill Tracks</h1>
        <p className="text-zinc-500 text-sm">Pick a skill. Complete daily tasks. Get paid.</p>
      </div>

      {/* Search */}
      <div className="px-4 mb-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tracks…"
            className="w-full bg-[#111111] border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#F5A623] transition-colors"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 px-4 overflow-x-auto pb-3 scrollbar-hide">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-full transition-colors ${
              activeFilter === f.value
                ? 'bg-[#F5A623] text-black'
                : 'bg-[#111111] border border-zinc-800 text-zinc-400 hover:border-zinc-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="px-4">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-400 text-sm">No tracks found.</p>
            {search && (
              <button onClick={() => setSearch('')} className="text-[#F5A623] text-sm mt-2 font-semibold">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {displayed.map((t) => (
              <TrackCard key={t._id} track={t} onEnroll={handleEnroll} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
