'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Shield, Clock, Star, CheckCircle2, AlertCircle,
  ExternalLink, Loader2, Users, Calendar, Send, ChevronDown,
} from 'lucide-react'

/* ─── types ─────────────────────────────────────────────────── */
interface ClientRef {
  _id?: string; full_name: string; role: string; created_at: string
}
interface GigDetail {
  _id: string; title: string; description: string; category: string
  budget_naira: number; platform_fee_naira: number; deadline_hours: number
  status: string; requirements: string; deliverables: string
  min_level: string; min_score: number; escrow_held: boolean
  client_id: ClientRef; client_stats: { avg_rating: number | null; total_posted: number }
  assigned_to?: string; created_at: string
}
interface Application { pitch: string; proposed_timeline_hours?: number; created_at: string }
interface PageData {
  gig: GigDetail; has_applied: boolean; application: Application | null
  is_assigned: boolean; is_client: boolean
}

/* ─── helpers ───────────────────────────────────────────────── */
const CAT_COLOR: Record<string, string> = {
  copywriting: 'text-blue-400 bg-blue-400/10',
  design: 'text-purple-400 bg-purple-400/10',
  social_media: 'text-pink-400 bg-pink-400/10',
  data_entry: 'text-zinc-400 bg-zinc-800',
  affiliate: 'text-green-400 bg-green-400/10',
  video: 'text-red-400 bg-red-400/10',
}

const LEVEL_COLOR: Record<string, string> = {
  novice: 'text-zinc-400 bg-zinc-800',
  apprentice: 'text-blue-400 bg-blue-400/10',
  pro: 'text-purple-400 bg-purple-400/10',
  mentor: 'text-[#F5A623] bg-[#F5A623]/10',
}

function fmt(n: number) { return `₦${n.toLocaleString('en-NG')}` }

function useCountdown(createdAt: string, hours: number) {
  const deadline = new Date(createdAt).getTime() + hours * 3_600_000
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])
  const diff = deadline - now
  if (diff <= 0) return { label: 'Expired', urgent: true }
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  return {
    label: h >= 48 ? `${Math.floor(h / 24)}d ${h % 24}h` : h > 0 ? `${h}h ${m}m` : `${m}m`,
    urgent: h < 24,
  }
}

/* ─── skeleton ──────────────────────────────────────────────── */
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 pt-6 animate-pulse space-y-4 pb-24">
      <div className="h-4 bg-zinc-800 rounded w-24" />
      <div className="h-7 bg-zinc-800 rounded w-3/4" />
      <div className="h-4 bg-zinc-800 rounded w-1/2" />
      <div className="h-28 bg-zinc-800 rounded-2xl" />
      <div className="h-20 bg-zinc-800 rounded-2xl" />
      <div className="h-32 bg-zinc-800 rounded-2xl" />
    </div>
  )
}

/* ─── escrow badge ──────────────────────────────────────────── */
function EscrowBadge({ amount }: { amount: number }) {
  return (
    <div className="flex items-center gap-3 bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-2xl px-5 py-4">
      <div className="w-10 h-10 rounded-xl bg-[#F5A623]/20 flex items-center justify-center flex-shrink-0">
        <Shield size={20} className="text-[#F5A623]" />
      </div>
      <div>
        <p className="text-[#F5A623] font-black text-sm">✓ {fmt(amount)} secured in escrow</p>
        <p className="text-zinc-500 text-xs mt-0.5">Payment is held securely. Released to you on approval.</p>
      </div>
    </div>
  )
}

/* ─── apply section ─────────────────────────────────────────── */
function ApplySection({ gigId, onSuccess }: { gigId: string; onSuccess: (app: Application) => void }) {
  const [pitch, setPitch] = useState('')
  const [hours, setHours] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!pitch.trim()) { setError('Write a pitch before applying.'); return }
    setSubmitting(true); setError('')
    const res = await fetch('/api/gigs/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gig_id: gigId, pitch: pitch.trim(), proposed_timeline_hours: hours ? Number(hours) : undefined }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error ?? 'Failed to apply.'); setSubmitting(false); return }
    onSuccess({ pitch: pitch.trim(), proposed_timeline_hours: hours ? Number(hours) : undefined, created_at: new Date().toISOString() })
    setSubmitting(false)
  }

  return (
    <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 space-y-4">
      <h3 className="text-white font-bold">Apply for This Gig</h3>
      <div>
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
          Your pitch <span className="text-zinc-600 normal-case font-normal">— why are you the best person?</span>
        </label>
        <textarea
          value={pitch}
          onChange={(e) => setPitch(e.target.value)}
          rows={5}
          placeholder="Briefly explain your experience, approach, and why you'll nail this gig. Be specific — generic pitches don't get selected."
          className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-xl p-4 text-white placeholder-zinc-600 text-sm leading-relaxed focus:outline-none focus:border-[#F5A623] transition-colors resize-none"
        />
        <p className="text-zinc-700 text-xs mt-1.5 text-right">{pitch.length} / 500</p>
      </div>
      <div>
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
          Estimated completion <span className="text-zinc-600 normal-case font-normal">(hours, optional)</span>
        </label>
        <input
          type="number"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="e.g. 12"
          min={1}
          className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#F5A623] transition-colors"
        />
      </div>
      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      <button
        onClick={submit}
        disabled={submitting || !pitch.trim()}
        className="w-full bg-[#F5A623] hover:bg-[#e09610] text-black font-bold rounded-xl py-4 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
        {submitting ? 'Submitting…' : 'Apply for This Gig'}
      </button>
      <p className="text-zinc-600 text-xs text-center">Applications are reviewed within 24 hours.</p>
    </div>
  )
}

/* ─── applied state ─────────────────────────────────────────── */
function AppliedState({ application }: { application: Application }) {
  return (
    <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 size={18} className="text-green-400" />
        <h3 className="text-white font-bold">Application Submitted</h3>
      </div>
      <div className="bg-[#0A0A0A] border border-zinc-800 rounded-xl p-4 mb-3">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Your pitch</p>
        <p className="text-zinc-300 text-sm leading-relaxed">{application.pitch}</p>
      </div>
      {application.proposed_timeline_hours && (
        <p className="text-zinc-500 text-xs">
          Estimated completion: <span className="text-white font-semibold">{application.proposed_timeline_hours}h</span>
        </p>
      )}
      <p className="text-zinc-600 text-xs mt-2">
        Applied {new Date(application.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
      </p>
    </div>
  )
}

/* ─── work submission interface ─────────────────────────────── */
function WorkSubmission({ gigId, currentStatus }: { gigId: string; currentStatus: string }) {
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(currentStatus === 'submitted')
  const [error, setError] = useState('')
  const [showNotes, setShowNotes] = useState(false)

  const submit = async () => {
    if (!url.trim()) { setError('Provide a deliverable URL.'); return }
    setSubmitting(true); setError('')
    const res = await fetch('/api/gigs/submit-work', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gig_id: gigId, submission_url: url.trim(), submission_notes: notes }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error ?? 'Submission failed.'); setSubmitting(false); return }
    setSubmitted(true); setSubmitting(false)
  }

  if (submitted || currentStatus === 'submitted') {
    return (
      <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 size={18} className="text-green-400" />
          <h3 className="text-white font-bold">Work Submitted</h3>
        </div>
        <p className="text-zinc-400 text-sm">Your work has been submitted. The client has 48 hours to review and approve. Payment will be released upon approval.</p>
      </div>
    )
  }

  return (
    <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 space-y-4">
      <h3 className="text-white font-bold">Submit Your Work</h3>
      <div>
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
          Deliverable URL <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <ExternalLink size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://docs.google.com/... or any shareable link"
            className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#F5A623] transition-colors"
          />
        </div>
      </div>
      <button onClick={() => setShowNotes((v) => !v)} className="flex items-center gap-1.5 text-zinc-500 text-xs hover:text-zinc-300 transition-colors">
        <ChevronDown size={13} className={`transition-transform ${showNotes ? 'rotate-180' : ''}`} />
        Add notes for client (optional)
      </button>
      {showNotes && (
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Anything the client should know about the submission…"
          className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-xl p-4 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#F5A623] transition-colors resize-none"
        />
      )}
      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      <button
        onClick={submit}
        disabled={submitting || !url.trim()}
        className="w-full bg-[#F5A623] hover:bg-[#e09610] text-black font-bold rounded-xl py-4 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
        {submitting ? 'Submitting…' : 'Submit Work for Review'}
      </button>
      <p className="text-zinc-600 text-xs text-center">Client has 48 hours to approve. Payment releases automatically.</p>
    </div>
  )
}

/* ─── main page ─────────────────────────────────────────────── */
export default function GigDetailPage() {
  const params = useParams()
  const gigId = params.gigId as string

  const [data, setData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/gigs/${gigId}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [gigId])

  const { label: timeLabel, urgent } = useCountdown(
    data?.gig.created_at ?? new Date().toISOString(),
    data?.gig.deadline_hours ?? 48
  )

  if (loading) return <PageSkeleton />
  if (!data) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <p className="text-zinc-400">Gig not found.</p>
    </div>
  )

  const { gig, has_applied, application, is_assigned, is_client } = data
  const cat = CAT_COLOR[gig.category] ?? CAT_COLOR.data_entry
  const workerNet = gig.budget_naira - (gig.platform_fee_naira ?? 0)

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-28">
      {/* Nav */}
      <div className="px-4 pt-5 pb-3">
        <Link href="/gigs" className="inline-flex items-center gap-1.5 text-zinc-500 text-xs hover:text-zinc-300 transition-colors mb-4">
          <ArrowLeft size={14} /> Marketplace
        </Link>

        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${cat}`}>
            {gig.category.replace('_', ' ')}
          </span>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${LEVEL_COLOR[gig.min_level] ?? LEVEL_COLOR.novice}`}>
            {gig.min_level}+ level
          </span>
          <span className={`flex items-center gap-1 text-[10px] font-semibold ${urgent ? 'text-red-400' : 'text-zinc-500'}`}>
            <Clock size={10} /> Closes in {timeLabel}
          </span>
        </div>

        <h1 className="text-white text-xl font-black leading-tight">{gig.title}</h1>

        {/* Pay summary */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-[#F5A623] font-black text-2xl">{fmt(workerNet)}</span>
          <span className="text-zinc-600 text-xs">you receive ({fmt(gig.budget_naira)} − {fmt(gig.platform_fee_naira ?? 0)} fee)</span>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Escrow badge */}
        {gig.escrow_held && <EscrowBadge amount={gig.budget_naira} />}

        {/* Description */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-white font-bold mb-3">About This Gig</h2>
          <p className="text-zinc-300 text-sm leading-relaxed">{gig.description}</p>
        </div>

        {/* Requirements */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-white font-bold mb-3">Requirements</h2>
          <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">{gig.requirements}</div>
        </div>

        {/* Deliverables */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-white font-bold mb-3">Deliverables</h2>
          <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">{gig.deliverables}</div>
        </div>

        {/* Client info panel */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-white font-bold mb-4">About the Client</h2>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">{gig.client_id.full_name[0]}</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{gig.client_id.full_name}</p>
              <p className="text-zinc-500 text-xs capitalize">{gig.client_id.role}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              {gig.client_stats.avg_rating !== null ? (
                <>
                  <div className="flex items-center justify-center gap-0.5 mb-1">
                    <Star size={13} className="text-[#F5A623] fill-[#F5A623]" />
                    <span className="text-white font-bold text-sm">{gig.client_stats.avg_rating.toFixed(1)}</span>
                  </div>
                  <p className="text-zinc-600 text-[10px]">Rating</p>
                </>
              ) : (
                <>
                  <p className="text-zinc-500 text-sm font-bold">New</p>
                  <p className="text-zinc-600 text-[10px]">Client</p>
                </>
              )}
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-0.5 mb-1">
                <Users size={12} className="text-zinc-500" />
                <span className="text-white font-bold text-sm">{gig.client_stats.total_posted}</span>
              </div>
              <p className="text-zinc-600 text-[10px]">Gigs Posted</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-0.5 mb-1">
                <Calendar size={12} className="text-zinc-500" />
                <span className="text-white font-bold text-sm">
                  {new Date(gig.client_id.created_at).getFullYear()}
                </span>
              </div>
              <p className="text-zinc-600 text-[10px]">Member since</p>
            </div>
          </div>
        </div>

        {/* Action section based on state */}
        {is_assigned ? (
          <WorkSubmission gigId={gig._id} currentStatus={gig.status} />
        ) : has_applied && application ? (
          <AppliedState application={application} />
        ) : !is_client && gig.status === 'open' ? (
          <ApplySection
            gigId={gig._id}
            onSuccess={(app) => setData((prev) => prev ? { ...prev, has_applied: true, application: app } : prev)}
          />
        ) : is_client ? (
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 text-center">
            <p className="text-zinc-400 text-sm">You posted this gig.</p>
            <Link href={`/admin/gigs/${gig._id}`} className="inline-flex items-center gap-1.5 text-[#F5A623] text-sm font-semibold mt-2 hover:underline">
              Manage Applications <ExternalLink size={13} />
            </Link>
          </div>
        ) : null}

        <p className="text-zinc-700 text-xs text-center pb-2">
          All payments are protected by SkillVest Escrow 🛡
        </p>
      </div>
    </div>
  )
}
