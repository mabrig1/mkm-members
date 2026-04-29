'use client'
import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Bell, TrendingUp, Wallet, Flame, Trophy, CheckSquare,
  Briefcase, ArrowRight, Send, X, MessageCircle, Loader2,
  ChevronRight, AlertTriangle, Sparkles,
} from 'lucide-react'

/* ─── types ─────────────────────────────────────────────────── */

interface TrackRef { _id: string; title: string; category: string; duration_days: number; slug: string }
interface Enrollment { current_day: number; progress_percentage: number; track_id: TrackRef }
interface Gig { _id: string; title: string; category: string; budget_naira: number; deadline_hours: number }
interface LeaderEntry { user_id: { full_name: string; university?: string }; total_earned_naira: number; rank?: number }
interface DashboardData {
  profile: { _id: string; full_name: string; role: string; level: number; xp_points: number; streak_days: number; wallet_balance: number; total_earned: number }
  enrollment: Enrollment | null
  stats: { tasks_completed: number; gigs_won: number; global_rank: number; weekly_earned: number }
  today_task_done: boolean
  open_gigs: Gig[]
  leaderboard: LeaderEntry[]
  sparkline: number[]
  unread_notifications: number
}
interface ChatMessage { role: 'user' | 'assistant'; content: string }

/* ─── helpers ───────────────────────────────────────────────── */

const ROLE_COLORS: Record<string, string> = {
  novice: 'text-zinc-400 bg-zinc-800',
  apprentice: 'text-blue-400 bg-blue-400/10',
  pro: 'text-purple-400 bg-purple-400/10',
  mentor: 'text-[#F5A623] bg-[#F5A623]/10',
  admin: 'text-red-400 bg-red-400/10',
}

const CAT_COLORS: Record<string, string> = {
  copywriting: 'text-blue-400 bg-blue-400/10',
  design: 'text-purple-400 bg-purple-400/10',
  video: 'text-red-400 bg-red-400/10',
  data_entry: 'text-zinc-400 bg-zinc-800',
  affiliate: 'text-green-400 bg-green-400/10',
  social_media: 'text-pink-400 bg-pink-400/10',
}

function fmt(n: number) { return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 0 })}` }
function truncateName(name: string) {
  const p = name.trim().split(' ')
  return p.length === 1 ? p[0] : `${p[0]} ${p[p.length - 1][0]}.`
}

/* ─── skeleton ──────────────────────────────────────────────── */

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse bg-zinc-800/70 rounded-xl ${className}`} />
}

function DashboardSkeleton() {
  return (
    <div className="px-4 pb-24 space-y-4 pt-6">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2"><Skeleton className="h-5 w-36" /><Skeleton className="h-3 w-24" /></div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <Skeleton className="h-44 w-full" />
      <Skeleton className="h-28 w-full" />
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" />
      </div>
      <Skeleton className="h-6 w-32" />
      <div className="flex gap-3 overflow-hidden">
        <Skeleton className="h-36 w-52 flex-shrink-0" />
        <Skeleton className="h-36 w-52 flex-shrink-0" />
        <Skeleton className="h-36 w-52 flex-shrink-0" />
      </div>
      <Skeleton className="h-52 w-full" />
    </div>
  )
}

/* ─── sparkline ─────────────────────────────────────────────── */

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const today = new Date().getDay()
  const labels = Array.from({ length: 7 }, (_, i) => DAY_LABELS[(today - 6 + i + 7) % 7])

  return (
    <div className="flex items-end gap-1.5 h-10">
      {data.map((v, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full rounded-sm transition-all duration-500"
            style={{
              height: `${Math.max((v / max) * 36, 3)}px`,
              background: i === 6 ? '#F5A623' : 'rgba(245,166,35,0.35)',
            }}
          />
          <span className="text-[9px] text-zinc-600">{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

/* ─── income coach widget ───────────────────────────────────── */

function IncomeCoachWidget({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hey! I\'m your SkillVest Income Coach. Ask me anything — pitching clients, finding gigs, improving your earnings. What\'s on your mind?' },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setSending(true)
    try {
      const res = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, user_id: userId }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response || 'Something went wrong.' }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Network error. Try again.' }])
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-4 z-40 w-14 h-14 rounded-full bg-[#F5A623] shadow-lg shadow-[#F5A623]/30 flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Open Income Coach"
      >
        <Sparkles size={22} className="text-black" />
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0A0A0A]">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-800 bg-[#111111]">
            <div className="w-9 h-9 rounded-full bg-[#F5A623]/15 border border-[#F5A623]/30 flex items-center justify-center flex-shrink-0">
              <Sparkles size={16} className="text-[#F5A623]" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Income Coach</p>
              <p className="text-zinc-500 text-xs">Powered by Claude AI</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center"
            >
              <X size={16} className="text-zinc-400" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#F5A623]/15 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                    <Sparkles size={11} className="text-[#F5A623]" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#F5A623] text-black font-medium rounded-br-sm'
                      : 'bg-[#111111] border border-zinc-800 text-zinc-200 rounded-bl-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-[#F5A623]/15 flex items-center justify-center mr-2 mt-1">
                  <Sparkles size={11} className="text-[#F5A623]" />
                </div>
                <div className="bg-[#111111] border border-zinc-800 rounded-2xl rounded-bl-sm px-4 py-3">
                  <Loader2 size={15} className="text-zinc-500 animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-4 border-t border-zinc-800 bg-[#111111]">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Ask your coach anything…"
                className="flex-1 bg-[#0A0A0A] border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#F5A623] transition-colors"
              />
              <button
                onClick={send}
                disabled={!input.trim() || sending}
                className="w-12 h-12 rounded-xl bg-[#F5A623] flex items-center justify-center disabled:opacity-40 transition-opacity flex-shrink-0"
              >
                <Send size={16} className="text-black" />
              </button>
            </div>
            <p className="text-zinc-700 text-xs text-center mt-2">Responses are AI-generated. Verify before acting.</p>
          </div>
        </div>
      )}
    </>
  )
}

/* ─── main page ─────────────────────────────────────────────── */

export default function DashboardPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  const userId = (session?.user as { id?: string } | undefined)?.id ?? ''

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load')
        return r.json()
      })
      .then(setData)
      .catch((e: Error) => setFetchError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardSkeleton />

  if (fetchError || !data) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-zinc-400 text-sm mb-4">Couldn&apos;t load your dashboard.</p>
          <button onClick={() => window.location.reload()} className="bg-[#F5A623] text-black font-bold rounded-xl px-6 py-3 text-sm">
            Retry
          </button>
        </div>
      </div>
    )
  }

  const { profile, enrollment, stats, sparkline, open_gigs, leaderboard, unread_notifications, today_task_done } = data
  const firstName = profile.full_name.split(' ')[0]
  const track = enrollment?.track_id

  const weeklyPositive = stats.weekly_earned >= 0

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-28">
      {/* ── 1. HEADER ──────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-[#0A0A0A]/90 backdrop-blur-sm border-b border-zinc-900 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-zinc-500 text-xs mb-0.5">Good {getGreeting()}</p>
            <div className="flex items-center gap-2">
              <h1 className="text-white font-bold text-lg leading-tight">{firstName} 👋</h1>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${ROLE_COLORS[profile.role] ?? ROLE_COLORS.novice}`}>
                {profile.role}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5">
              <Flame size={14} className="text-orange-400" />
              <span className="text-white text-xs font-bold">{profile.streak_days}</span>
            </div>
            <Link href="/notifications" className="relative w-10 h-10 flex items-center justify-center">
              <Bell size={20} className="text-zinc-400" />
              {unread_notifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#F5A623] text-black text-[9px] font-black flex items-center justify-center">
                  {unread_notifications > 9 ? '9+' : unread_notifications}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* ── 2. EARNINGS HERO CARD ───────────────────────────────── */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-1">Total Earned</p>
              <p className="text-white text-3xl font-black tracking-tight">{fmt(profile.total_earned)}</p>
              <div className={`flex items-center gap-1 mt-1 ${weeklyPositive ? 'text-green-400' : 'text-red-400'}`}>
                <TrendingUp size={12} />
                <span className="text-xs font-semibold">
                  {weeklyPositive ? '+' : ''}{fmt(stats.weekly_earned)} this week
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-1">Wallet</p>
              <p className="text-white text-xl font-bold">{fmt(profile.wallet_balance)}</p>
              <Link
                href="/wallet"
                className="inline-flex items-center gap-1 mt-1.5 bg-[#F5A623] text-black text-xs font-bold px-3 py-1.5 rounded-lg"
              >
                <Wallet size={11} /> Withdraw
              </Link>
            </div>
          </div>

          {/* Sparkline */}
          <div className="pt-3 border-t border-zinc-800/60">
            <p className="text-zinc-600 text-[10px] uppercase tracking-wider font-semibold mb-2">Last 7 days</p>
            <Sparkline data={sparkline} />
          </div>
        </div>

        {/* ── 3. ACTIVE TRACK PROGRESS ───────────────────────────── */}
        {track ? (
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 pr-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CAT_COLORS[track.category] ?? CAT_COLORS.copywriting}`}>
                    {track.category.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-white font-bold text-base leading-snug">{track.title}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[#F5A623] text-lg font-black">{enrollment.current_day}</p>
                <p className="text-zinc-600 text-xs">of {track.duration_days} days</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#F5A623] rounded-full transition-all duration-700"
                  style={{ width: `${enrollment.progress_percentage || (enrollment.current_day / track.duration_days) * 100}%` }}
                />
              </div>
              <p className="text-zinc-600 text-xs mt-1">
                {Math.round(enrollment.progress_percentage || (enrollment.current_day / track.duration_days) * 100)}% complete
              </p>
            </div>

            {!today_task_done && (
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5 mb-3">
                <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" />
                <p className="text-amber-300 text-xs font-medium">Complete today&apos;s task to keep your streak</p>
              </div>
            )}

            <Link
              href={`/tracks/${track.slug ?? track._id}`}
              className="flex items-center justify-center gap-2 w-full bg-[#F5A623] hover:bg-[#e09610] text-black font-bold rounded-xl py-3.5 text-sm transition-colors"
            >
              Continue Day {enrollment.current_day} <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 text-center">
            <p className="text-zinc-400 text-sm mb-3">You&apos;re not enrolled in any track yet.</p>
            <Link href="/tracks" className="inline-flex items-center gap-2 bg-[#F5A623] text-black font-bold rounded-xl px-5 py-3 text-sm">
              Browse Tracks <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {/* ── 4. QUICK STATS ─────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: CheckSquare, label: 'Tasks Done', value: stats.tasks_completed, color: 'text-green-400' },
            { icon: Briefcase, label: 'Gigs Won', value: stats.gigs_won, color: 'text-blue-400' },
            { icon: Trophy, label: 'Global Rank', value: `#${stats.global_rank.toLocaleString()}`, color: 'text-[#F5A623]' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-[#111111] border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center min-h-[80px]">
              <Icon size={18} className={`${color} mb-1.5`} />
              <p className="text-white font-bold text-lg leading-none">{value}</p>
              <p className="text-zinc-500 text-[10px] mt-1 font-medium uppercase tracking-wide leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* ── 5. AVAILABLE GIGS ──────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold text-base">Available Gigs</h2>
            <Link href="/gigs" className="flex items-center gap-1 text-[#F5A623] text-xs font-semibold">
              See all <ChevronRight size={14} />
            </Link>
          </div>

          {open_gigs.length === 0 ? (
            <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 text-center">
              <p className="text-zinc-500 text-sm">No open gigs right now. Check back soon.</p>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {open_gigs.map((gig) => (
                <div
                  key={gig._id}
                  className="flex-shrink-0 w-56 bg-[#111111] border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between"
                >
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${CAT_COLORS[gig.category] ?? CAT_COLORS.copywriting}`}>
                      {gig.category.replace('_', ' ')}
                    </span>
                    <p className="text-white font-semibold text-sm mt-2 leading-snug line-clamp-2">{gig.title}</p>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="text-[#F5A623] font-black text-base">{fmt(gig.budget_naira)}</p>
                      <p className="text-zinc-500 text-xs">{gig.deadline_hours}h left</p>
                    </div>
                    <Link
                      href={`/gigs/${gig._id}`}
                      className="block w-full text-center bg-[#F5A623] text-black font-bold rounded-xl py-2.5 text-xs transition-colors hover:bg-[#e09610]"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 6. LEADERBOARD SNAPSHOT ────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold text-base">Top Earners This Week</h2>
            <Link href="/leaderboard" className="flex items-center gap-1 text-[#F5A623] text-xs font-semibold">
              Full board <ChevronRight size={14} />
            </Link>
          </div>

          <div className="bg-[#111111] border border-zinc-800 rounded-2xl overflow-hidden">
            {leaderboard.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-zinc-500 text-sm">Leaderboard resets every Sunday. Be first this week.</p>
              </div>
            ) : (
              leaderboard.map((entry, i) => {
                const name = entry.user_id?.full_name ? truncateName(entry.user_id.full_name) : '—'
                const uni = entry.user_id?.university
                const rankEmoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
                return (
                  <div
                    key={i}
                    className={`flex items-center px-4 py-3.5 ${i < leaderboard.length - 1 ? 'border-b border-zinc-800/60' : ''}`}
                  >
                    <div className="w-7 text-center flex-shrink-0">
                      {rankEmoji ? (
                        <span className="text-base">{rankEmoji}</span>
                      ) : (
                        <span className="text-zinc-600 text-sm font-bold">#{i + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 px-3">
                      <p className="text-white font-semibold text-sm">{name}</p>
                      {uni && <p className="text-zinc-600 text-xs truncate">{uni}</p>}
                    </div>
                    <p className="text-[#F5A623] font-bold text-sm flex-shrink-0">{fmt(entry.total_earned_naira)}</p>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Bottom padding note */}
        <p className="text-zinc-700 text-xs text-center pb-2">SkillVest · Building Nigerian earners daily 🇳🇬</p>
      </div>

      {/* ── 7. INCOME COACH WIDGET ─────────────────────────────── */}
      {userId && <IncomeCoachWidget userId={userId} />}
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
