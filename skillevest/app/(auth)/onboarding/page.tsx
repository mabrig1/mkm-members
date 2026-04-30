'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, Target, Briefcase, TrendingUp, Lightbulb, Clock, BarChart2, Share2, ArrowRight, Check } from 'lucide-react'

/* ─── data ─────────────────────────────────────────────────── */

const GOALS = [
  { id: 'first_5k', label: 'Earn my first ₦5,000', icon: Target, description: 'Start small, prove it works' },
  { id: 'quit_job', label: 'Leave my part-time job', icon: Briefcase, description: 'Replace that income for good' },
  { id: 'freelance', label: 'Build a freelance career', icon: TrendingUp, description: 'Long-term independent income' },
  { id: 'fund_biz', label: 'Fund my business idea', icon: Lightbulb, description: 'Earn capital while you plan' },
]

const TRACKS = [
  {
    slug: 'cold-email-copywriting',
    title: 'Cold Email Copywriting',
    category: 'copywriting',
    duration: 14,
    avgEarning: '₦15,000–₦40,000/mo',
    difficulty: 'Beginner',
    difficultyColor: 'text-emerald-400 bg-emerald-400/10',
    description: 'Write emails that get replies. Sell this skill on Fiverr from Day 7.',
    emoji: '✉️',
  },
  {
    slug: 'canva-social-media-design',
    title: 'Canva Social Media Design',
    category: 'design',
    duration: 14,
    avgEarning: '₦20,000–₦60,000/mo',
    difficulty: 'Beginner',
    difficultyColor: 'text-emerald-400 bg-emerald-400/10',
    description: 'Create scroll-stopping graphics. Nigerian businesses pay well for this.',
    emoji: '🎨',
  },
  {
    slug: 'whatsapp-business-marketing',
    title: 'WhatsApp Business Marketing',
    category: 'social_media',
    duration: 14,
    avgEarning: '₦12,000–₦35,000/mo',
    difficulty: 'Beginner',
    difficultyColor: 'text-emerald-400 bg-emerald-400/10',
    description: 'The #1 marketing channel in Nigeria. High demand, low competition.',
    emoji: '📱',
  },
]

/* ─── step indicator ────────────────────────────────────────── */

function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i === current ? 'w-6 h-2 bg-[#F5A623]' : i < current ? 'w-2 h-2 bg-[#F5A623]/40' : 'w-2 h-2 bg-zinc-700'
          }`}
        />
      ))}
    </div>
  )
}

/* ─── main page ─────────────────────────────────────────────── */

export default function OnboardingPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const userId = (session?.user as Record<string, string> | undefined)?.id

  /* ── step 1: goal ─────────────────────────────────────────── */
  const Step1 = (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">What&apos;s your goal?</h2>
      <p className="text-zinc-500 text-sm mb-6">This helps us personalise your experience.</p>

      <div className="space-y-3">
        {GOALS.map(({ id, label, icon: Icon, description }) => {
          const active = selectedGoal === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSelectedGoal(id)}
              className={`w-full text-left flex items-center gap-4 px-4 py-4 rounded-xl border transition-all duration-200 ${
                active
                  ? 'bg-[#F5A623]/10 border-[#F5A623] text-white'
                  : 'bg-[#0A0A0A] border-zinc-800 text-zinc-300 hover:border-zinc-600'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-[#F5A623]/20' : 'bg-zinc-800'}`}>
                <Icon size={18} className={active ? 'text-[#F5A623]' : 'text-zinc-400'} />
              </div>
              <div>
                <p className="font-semibold text-sm">{label}</p>
                <p className={`text-xs mt-0.5 ${active ? 'text-zinc-400' : 'text-zinc-600'}`}>{description}</p>
              </div>
              {active && (
                <div className="ml-auto w-5 h-5 rounded-full bg-[#F5A623] flex items-center justify-center flex-shrink-0">
                  <Check size={12} className="text-black" strokeWidth={3} />
                </div>
              )}
            </button>
          )
        })}
      </div>

      <button
        onClick={() => selectedGoal && setStep(1)}
        disabled={!selectedGoal}
        className="w-full mt-6 bg-[#F5A623] hover:bg-[#e09610] text-black font-bold rounded-xl py-3.5 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        Continue <ArrowRight size={16} />
      </button>
    </div>
  )

  /* ── step 2: track ────────────────────────────────────────── */
  const Step2 = (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Pick your first skill track</h2>
      <p className="text-zinc-500 text-sm mb-6">All tracks are beginner-friendly. Pick one and commit.</p>

      <div className="space-y-3">
        {TRACKS.map((track) => {
          const active = selectedTrack === track.slug
          return (
            <button
              key={track.slug}
              type="button"
              onClick={() => setSelectedTrack(track.slug)}
              className={`w-full text-left px-4 py-4 rounded-xl border transition-all duration-200 ${
                active
                  ? 'bg-[#F5A623]/10 border-[#F5A623]'
                  : 'bg-[#0A0A0A] border-zinc-800 hover:border-zinc-600'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl mt-0.5">{track.emoji}</span>
                  <div>
                    <p className={`font-semibold text-sm ${active ? 'text-white' : 'text-zinc-200'}`}>{track.title}</p>
                    <p className={`text-xs mt-0.5 mb-2 ${active ? 'text-zinc-400' : 'text-zinc-600'}`}>{track.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${track.difficultyColor}`}>
                        {track.difficulty}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-zinc-500">
                        <Clock size={11} /> {track.duration} days
                      </span>
                      <span className="flex items-center gap-1 text-xs text-zinc-500">
                        <BarChart2 size={11} /> {track.avgEarning}
                      </span>
                    </div>
                  </div>
                </div>
                {active && (
                  <div className="w-5 h-5 rounded-full bg-[#F5A623] flex items-center justify-center flex-shrink-0 mt-1">
                    <Check size={12} className="text-black" strokeWidth={3} />
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => setStep(0)}
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl py-3.5 text-sm transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => selectedTrack && setStep(2)}
          disabled={!selectedTrack}
          className="flex-[2] bg-[#F5A623] hover:bg-[#e09610] text-black font-bold rounded-xl py-3.5 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Choose this track <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )

  /* ── step 3: confirm ──────────────────────────────────────── */
  const chosenTrack = TRACKS.find((t) => t.slug === selectedTrack)
  const chosenGoal = GOALS.find((g) => g.id === selectedGoal)

  const handleStart = async () => {
    if (!userId || !selectedGoal || !selectedTrack) return
    setIsSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, goal: selectedGoal, track_slug: selectedTrack }),
      })
      if (!res.ok) {
        const json = await res.json()
        setError(json.error || 'Something went wrong')
        setIsSubmitting(false)
        return
      }
      router.push('/dashboard')
    } catch {
      setError('Network error. Please try again.')
      setIsSubmitting(false)
    }
  }

  const shareText = `I just committed to earning my first income online through SkillVest 🚀\n14-day challenge starts NOW.\n\nJoin me: ${process.env.NEXT_PUBLIC_APP_URL}`

  const Step3 = (
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#F5A623]/15 border border-[#F5A623]/30 flex items-center justify-center mx-auto mb-5">
        <span className="text-3xl">{chosenTrack?.emoji}</span>
      </div>

      <h2 className="text-xl font-bold text-white mb-2">You&apos;re ready.</h2>
      <p className="text-zinc-500 text-sm mb-6">Here&apos;s your 14-day challenge commitment.</p>

      {/* Commitment card */}
      <div className="bg-[#0A0A0A] border border-zinc-800 rounded-xl p-5 text-left mb-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
            {chosenGoal && <chosenGoal.icon size={15} className="text-[#F5A623]" />}
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Your goal</p>
            <p className="text-white text-sm font-semibold">{chosenGoal?.label}</p>
          </div>
        </div>
        <div className="border-t border-zinc-800 pt-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0 text-base">
            {chosenTrack?.emoji}
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Your track</p>
            <p className="text-white text-sm font-semibold">{chosenTrack?.title}</p>
          </div>
        </div>
        <div className="border-t border-zinc-800 pt-3">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Potential earnings</p>
          <p className="text-[#F5A623] font-bold">{chosenTrack?.avgEarning}</p>
        </div>
      </div>

      <div className="bg-[#F5A623]/5 border border-[#F5A623]/20 rounded-xl p-4 mb-5">
        <p className="text-sm text-zinc-300 leading-relaxed">
          Complete one task per day for 14 days. No skipping. No excuses.
          <span className="text-[#F5A623] font-semibold"> You&apos;ll be earning by day 10.</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={handleStart}
          disabled={isSubmitting}
          className="w-full bg-[#F5A623] hover:bg-[#e09610] text-black font-bold rounded-xl py-4 text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? 'Setting up your dashboard…' : '🚀 Start Day 1 Now'}
        </button>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ text: shareText }).catch(() => {})
            } else {
              navigator.clipboard.writeText(shareText)
            }
          }}
          className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl py-3.5 text-sm transition-colors"
        >
          <Share2 size={15} /> Tell a friend (earn referral bonus)
        </button>
      </div>

      <button
        onClick={() => setStep(1)}
        className="mt-4 text-zinc-600 text-xs hover:text-zinc-400 transition-colors"
      >
        ← Change my track
      </button>
    </div>
  )

  return (
    <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-8">
      <StepDots current={step} />
      {step === 0 && Step1}
      {step === 1 && Step2}
      {step === 2 && Step3}
    </div>
  )
}
