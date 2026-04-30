'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, CheckCircle2, Lock, Circle, Clock, Users, TrendingUp,
  ChevronRight, Loader2, Star,
} from 'lucide-react'

/* ─── types ─────────────────────────────────────────────────── */
interface CurriculumDay {
  _id: string
  day_number: number
  title: string
  submission_type: string
  xp_reward: number
  naira_reward: number
  is_current: boolean
  is_completed: boolean
  is_locked: boolean
  score?: number
}

interface Track {
  _id: string
  title: string
  slug: string
  category: string
  description: string
  full_description?: string
  duration_days: number
  difficulty: string
  is_premium: boolean
  avg_earning_naira: number
  enrolled_count: number
  completion_rate: number
}

interface TrackData {
  track: Track
  curriculum: CurriculumDay[]
  enrollment: { status: string; current_day: number; progress_percentage: number } | null
}

/* ─── helpers ───────────────────────────────────────────────── */
const CAT_GRADIENT: Record<string, string> = {
  copywriting: 'from-blue-600 to-violet-700',
  design: 'from-pink-600 to-purple-700',
  video: 'from-red-600 to-orange-600',
  social_media: 'from-pink-500 to-rose-600',
  affiliate: 'from-green-600 to-teal-600',
  data_entry: 'from-zinc-600 to-slate-700',
}

const DIFF_COLOR: Record<string, string> = {
  beginner: 'text-emerald-400 bg-emerald-400/10',
  intermediate: 'text-yellow-400 bg-yellow-400/10',
  advanced: 'text-red-400 bg-red-400/10',
}

const TYPE_ICON: Record<string, string> = {
  text: '✍️', link: '🔗', image: '🖼️', file: '📎',
}

function fmt(n: number) { return `₦${n.toLocaleString('en-NG')}` }

/* ─── skeleton ──────────────────────────────────────────────── */
function PageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-52 bg-zinc-800" />
      <div className="px-4 pt-4 space-y-3">
        <div className="h-4 bg-zinc-800 rounded w-20" />
        <div className="h-6 bg-zinc-800 rounded w-2/3" />
        <div className="h-3 bg-zinc-800 rounded w-full" />
        <div className="h-3 bg-zinc-800 rounded w-3/4" />
        <div className="h-12 bg-zinc-800 rounded-xl mt-4" />
      </div>
    </div>
  )
}

/* ─── curriculum day row ────────────────────────────────────── */
function DayRow({ day, trackId }: { day: CurriculumDay; trackId: string }) {
  const router = useRouter()

  const icon = day.is_completed
    ? <CheckCircle2 size={18} className="text-[#F5A623]" />
    : day.is_locked
    ? <Lock size={16} className="text-zinc-600" />
    : day.is_current
    ? <div className="w-[18px] h-[18px] rounded-full border-2 border-[#F5A623] bg-[#F5A623]/20" />
    : <Circle size={18} className="text-zinc-600" />

  const rowStyle = day.is_locked
    ? 'opacity-50 cursor-not-allowed'
    : day.is_current
    ? 'border-[#F5A623]/30 bg-[#F5A623]/5 cursor-pointer'
    : 'cursor-pointer hover:border-zinc-600'

  return (
    <div
      onClick={() => !day.is_locked && router.push(`/tasks/${day._id}`)}
      className={`flex items-center gap-3 px-4 py-3.5 border border-zinc-800 rounded-xl transition-all ${rowStyle}`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-xs font-semibold ${day.is_current ? 'text-[#F5A623]' : 'text-zinc-500'}`}>
            Day {day.day_number}
          </p>
          <span className="text-zinc-700 text-xs">{TYPE_ICON[day.submission_type]}</span>
        </div>
        <p className={`text-sm font-medium leading-snug truncate ${day.is_locked ? 'text-zinc-600' : 'text-white'}`}>
          {day.title}
        </p>
      </div>
      <div className="flex-shrink-0 text-right">
        {day.is_completed && day.score !== undefined ? (
          <p className="text-[#F5A623] text-xs font-bold">{Math.round(day.score)}%</p>
        ) : (
          <div className="flex flex-col items-end gap-0.5">
            <p className="text-zinc-500 text-[10px]">+{day.xp_reward} XP</p>
            {day.naira_reward ? (
              <p className="text-green-400 text-[10px]">+{fmt(day.naira_reward)}</p>
            ) : null}
          </div>
        )}
        {!day.is_locked && <ChevronRight size={14} className="text-zinc-600 mt-0.5 ml-auto" />}
      </div>
    </div>
  )
}

/* ─── earnings proof ────────────────────────────────────────── */
function EarningsProof({ track }: { track: Track }) {
  const testimonials = [
    { name: 'Adaeze O.', uni: 'UNILAG', earned: 28500, weeks: 3 },
    { name: 'Emeka T.', uni: 'ABU Zaria', earned: 15200, weeks: 2 },
    { name: 'Fatima K.', uni: 'UI Ibadan', earned: 42000, weeks: 5 },
  ]
  return (
    <div className="space-y-3">
      <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5">
        <p className="text-zinc-400 text-xs uppercase tracking-wider font-semibold mb-1">Average Monthly Earnings</p>
        <p className="text-[#F5A623] text-3xl font-black">{fmt(track.avg_earning_naira)}</p>
        <p className="text-zinc-500 text-xs mt-1">Based on active students on this track</p>
      </div>
      <p className="text-zinc-500 text-xs px-1 font-semibold uppercase tracking-wide">Recent student earnings</p>
      {testimonials.map((t) => (
        <div key={t.name} className="bg-[#111111] border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">{t.name[0]}</span>
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">{t.name}</p>
            <p className="text-zinc-500 text-xs">{t.uni} · {t.weeks} weeks in</p>
          </div>
          <div className="text-right">
            <p className="text-green-400 font-bold text-sm">{fmt(t.earned)}</p>
            <div className="flex items-center gap-0.5 justify-end mt-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} size={9} className="text-[#F5A623] fill-[#F5A623]" />)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── main page ─────────────────────────────────────────────── */
export default function TrackDetailPage() {
  const params = useParams()
  const trackId = params.trackId as string

  const [data, setData] = useState<TrackData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'earnings'>('overview')
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    fetch(`/api/tracks/${trackId}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [trackId])

  const handleEnroll = async () => {
    setEnrolling(true)
    const res = await fetch('/api/tracks/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ track_id: trackId }),
    })
    const json = await res.json()
    setData((prev) =>
      prev
        ? { ...prev, enrollment: json.enrollment }
        : prev
    )
    setEnrolling(false)
    setActiveTab('curriculum')
  }

  if (loading) return <div className="min-h-screen bg-[#0A0A0A]"><PageSkeleton /></div>
  if (!data) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <p className="text-zinc-400">Track not found.</p>
    </div>
  )

  const { track, curriculum, enrollment } = data
  const gradient = CAT_GRADIENT[track.category] ?? CAT_GRADIENT.data_entry
  const currentDay = curriculum.find((d) => d.is_current)

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-28">
      {/* Hero */}
      <div className={`bg-gradient-to-br ${gradient} pt-safe`}>
        <div className="px-4 pt-4 pb-6">
          <Link href="/tracks" className="inline-flex items-center gap-1 text-white/70 text-sm mb-4">
            <ArrowLeft size={16} /> All Tracks
          </Link>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-black/30 text-white/90 uppercase tracking-wide">
                  {track.category.replace('_', ' ')}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-black/20 ${DIFF_COLOR[track.difficulty]}`}>
                  {track.difficulty}
                </span>
              </div>
              <h1 className="text-white text-2xl font-black leading-tight">{track.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 text-white/70 text-xs">
            <span className="flex items-center gap-1"><Clock size={12} /> {track.duration_days} days</span>
            <span className="flex items-center gap-1"><Users size={12} /> {track.enrolled_count.toLocaleString()} students</span>
            <span className="flex items-center gap-1 text-white font-semibold"><TrendingUp size={12} /> {fmt(track.avg_earning_naira)}/mo</span>
          </div>
        </div>
      </div>

      {/* Progress bar if enrolled */}
      {enrollment && (
        <div className="bg-[#111111] border-b border-zinc-800 px-4 py-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-zinc-400">Day {enrollment.current_day} of {track.duration_days}</span>
            <span className="text-[#F5A623] font-semibold">{Math.round(enrollment.progress_percentage)}%</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-[#F5A623] rounded-full" style={{ width: `${enrollment.progress_percentage}%` }} />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 px-4 bg-[#0A0A0A] sticky top-0 z-20">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'curriculum', label: 'Curriculum' },
          { key: 'earnings', label: 'Earnings Proof' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={`px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === key
                ? 'border-[#F5A623] text-[#F5A623]'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="px-4 pt-4">
        {/* Overview tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-white font-bold mb-2">About this track</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {track.full_description || track.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Duration', value: `${track.duration_days} days` },
                { label: 'Avg Earnings', value: fmt(track.avg_earning_naira) + '/mo' },
                { label: 'Students', value: track.enrolled_count.toLocaleString() },
                { label: 'Completion Rate', value: `${Math.round(track.completion_rate)}%` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#111111] border border-zinc-800 rounded-xl p-4">
                  <p className="text-zinc-500 text-xs uppercase tracking-wide font-semibold mb-1">{label}</p>
                  <p className="text-white font-bold">{value}</p>
                </div>
              ))}
            </div>

            {!enrollment ? (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full bg-[#F5A623] hover:bg-[#e09610] text-black font-bold rounded-xl py-4 text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {enrolling && <Loader2 size={16} className="animate-spin" />}
                {enrolling ? 'Enrolling…' : '🚀 Start This Track Free'}
              </button>
            ) : enrollment.status === 'completed' ? (
              <div className="flex items-center justify-center gap-2 bg-zinc-800 text-zinc-400 font-bold rounded-xl py-4 text-sm">
                <CheckCircle2 size={16} /> Track Completed
              </div>
            ) : (
              currentDay && (
                <Link
                  href={`/tasks/${currentDay._id}`}
                  className="flex items-center justify-center gap-2 w-full bg-[#F5A623] text-black font-bold rounded-xl py-4 text-sm"
                >
                  Continue Day {enrollment.current_day} <ChevronRight size={16} />
                </Link>
              )
            )}
          </div>
        )}

        {/* Curriculum tab */}
        {activeTab === 'curriculum' && (
          <div className="space-y-2">
            {curriculum.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-8">No tasks added yet.</p>
            ) : (
              curriculum.map((day) => <DayRow key={day._id} day={day} trackId={trackId} />)
            )}
          </div>
        )}

        {/* Earnings Proof tab */}
        {activeTab === 'earnings' && <EarningsProof track={track} />}
      </div>
    </div>
  )
}
