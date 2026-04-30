'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, ArrowRight, CheckCircle2, XCircle, AlertCircle,
  Loader2, ExternalLink, Upload, RotateCcw, BookOpen, Send,
  Zap, TrendingUp,
} from 'lucide-react'
import type { AIGradingResult } from '@/types'

/* ─── types ─────────────────────────────────────────────────── */
interface Task {
  _id: string
  title: string
  description: string
  instructions: string
  day_number: number
  submission_type: 'text' | 'link' | 'image' | 'file'
  grading_rubric: Record<string, number>
  max_score: number
  xp_reward: number
  naira_reward: number
  resources: Array<{ label: string; url: string }>
}
interface TrackRef { _id: string; title: string; slug: string; duration_days: number }
interface UserTaskState {
  _id: string
  status: string
  attempts: number
  ai_feedback?: AIGradingResult
  final_score?: number
}
interface PageData { task: Task; track: TrackRef; userTask: UserTaskState; nextTaskId: string | null }
interface SubmitResult {
  gradingResult: AIGradingResult
  userTask: UserTaskState
  nextTaskId: string | null
  leveledUp: boolean
  trackSlug: string
}

/* ─── score circle ──────────────────────────────────────────── */
function ScoreCircle({ score, max }: { score: number; max: number }) {
  const pct = Math.round((score / max) * 100)
  const color = pct >= 70 ? '#22c55e' : pct >= 50 ? '#eab308' : '#ef4444'
  const r = 15.9
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r={r} fill="none" stroke="#27272a" strokeWidth="2.5" />
        <circle
          cx="18" cy="18" r={r} fill="none"
          stroke={color} strokeWidth="2.5"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-white text-xl font-black leading-none">{Math.round(score)}</span>
        <span className="text-zinc-500 text-xs">/{max}</span>
      </div>
    </div>
  )
}

/* ─── grading result card ───────────────────────────────────── */
function GradingResultCard({
  result, attempts, nextTaskId, trackId, leveledUp, onRetry,
}: {
  result: AIGradingResult
  attempts: number
  nextTaskId: string | null
  trackId: string
  leveledUp: boolean
  onRetry: () => void
}) {
  const router = useRouter()
  const passed = result.passed
  const pct = result.percentage

  const statusColor = pct >= 70 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'
  const statusBg = pct >= 70 ? 'bg-green-400/10 border-green-400/20' : pct >= 50 ? 'bg-yellow-400/10 border-yellow-400/20' : 'bg-red-400/10 border-red-400/20'

  return (
    <div className="bg-[#111111] border border-zinc-800 rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      {/* Status banner */}
      <div className={`border-b ${statusBg} px-5 py-4 flex items-center gap-3`}>
        {passed
          ? <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
          : attempts >= 3
          ? <XCircle size={20} className="text-red-400 flex-shrink-0" />
          : <AlertCircle size={20} className="text-yellow-400 flex-shrink-0" />}
        <div>
          <p className={`font-bold text-sm ${statusColor}`}>
            {passed ? '🎉 Task Passed!' : attempts >= 3 ? 'Max attempts reached' : 'Not quite there yet'}
          </p>
          <p className="text-zinc-500 text-xs">
            {passed ? 'XP awarded. Keep the streak going.' : attempts >= 3 ? 'Review feedback and try the next task.' : `${3 - attempts} attempt${3 - attempts === 1 ? '' : 's'} remaining`}
          </p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Score */}
        <div className="text-center">
          <ScoreCircle score={result.total_score} max={result.max_score} />
          <p className={`text-lg font-black mt-2 ${statusColor}`}>{pct}%</p>
          {passed && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <Zap size={14} className="text-[#F5A623]" />
              <span className="text-[#F5A623] text-sm font-semibold">+XP earned</span>
              {leveledUp && (
                <>
                  <TrendingUp size={14} className="text-purple-400" />
                  <span className="text-purple-400 text-sm font-semibold">Level up!</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Overall feedback */}
        <div className="bg-[#0A0A0A] border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-300 text-sm leading-relaxed">{result.overall_feedback}</p>
        </div>

        {/* Strengths */}
        {result.strengths?.length > 0 && (
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">What you did well</p>
            <div className="space-y-1.5">
              {result.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-zinc-300 text-sm">{s}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Improvements */}
        {result.improvements?.length > 0 && (
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Improve next time</p>
            <div className="space-y-1.5">
              {result.improvements.map((imp, i) => (
                <div key={i} className="flex items-start gap-2">
                  <AlertCircle size={14} className="text-orange-400 flex-shrink-0 mt-0.5" />
                  <p className="text-zinc-300 text-sm">{imp}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 pt-1">
          {passed && nextTaskId ? (
            <Link
              href={`/tasks/${nextTaskId}`}
              className="flex items-center justify-center gap-2 w-full bg-[#F5A623] text-black font-bold rounded-xl py-4 text-sm"
            >
              Next Task <ArrowRight size={16} />
            </Link>
          ) : passed ? (
            <Link
              href={`/tracks/${trackId}`}
              className="flex items-center justify-center gap-2 w-full bg-[#F5A623] text-black font-bold rounded-xl py-4 text-sm"
            >
              🏁 Track Complete — View Results
            </Link>
          ) : attempts < 3 ? (
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl py-4 text-sm transition-colors"
            >
              <RotateCcw size={15} /> Try Again
            </button>
          ) : (
            <Link
              href={`/tracks/${trackId}`}
              className="flex items-center justify-center gap-2 w-full bg-zinc-800 text-zinc-300 font-bold rounded-xl py-4 text-sm"
            >
              <ArrowLeft size={15} /> Back to Track
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── submission inputs ─────────────────────────────────────── */
function TextInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const MAX = 2000
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={MAX}
        rows={8}
        placeholder="Write your submission here. Be thorough — the AI grader rewards detail and clarity…"
        className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-xl p-4 text-white placeholder-zinc-600 text-sm leading-relaxed focus:outline-none focus:border-[#F5A623] transition-colors resize-none"
      />
      <div className="flex justify-between mt-1.5">
        <p className="text-zinc-600 text-xs">Tip: answer each rubric criterion explicitly</p>
        <p className={`text-xs ${value.length > MAX * 0.9 ? 'text-yellow-400' : 'text-zinc-600'}`}>
          {value.length}/{MAX}
        </p>
      </div>
    </div>
  )
}

function LinkInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const isValid = value.startsWith('http://') || value.startsWith('https://')
  return (
    <div>
      <div className="relative">
        <ExternalLink size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://your-work-link.com"
          className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#F5A623] transition-colors"
        />
      </div>
      {value && !isValid && (
        <p className="text-red-400 text-xs mt-1.5">Enter a valid URL starting with http:// or https://</p>
      )}
      {isValid && (
        <a href={value} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#F5A623] text-xs mt-1.5 hover:underline">
          <ExternalLink size={11} /> Preview link
        </a>
      )}
      <p className="text-zinc-600 text-xs mt-2">Share a Google Doc, Notion page, Figma file, or any public URL.</p>
    </div>
  )
}

function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string>('')
  const [dragging, setDragging] = useState(false)

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreview(result)
      onChange(result) // send base64 as submission content
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
          dragging ? 'border-[#F5A623] bg-[#F5A623]/5' : 'border-zinc-700 hover:border-zinc-500'
        }`}
      >
        <Upload size={24} className="text-zinc-500" />
        <div className="text-center">
          <p className="text-zinc-300 text-sm font-medium">Drop your image here</p>
          <p className="text-zinc-600 text-xs mt-1">or click to browse — JPG, PNG, GIF (max 5MB)</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
      </div>

      {preview && (
        <div className="rounded-xl overflow-hidden border border-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="w-full max-h-64 object-cover" />
          <div className="px-3 py-2 flex items-center justify-between">
            <p className="text-zinc-400 text-xs">Image ready to submit</p>
            <button onClick={() => { setPreview(''); onChange('') }} className="text-red-400 text-xs hover:underline">Remove</button>
          </div>
        </div>
      )}

      <p className="text-zinc-600 text-xs">Or paste an image URL below:</p>
      <input
        type="url"
        value={preview ? '' : value}
        onChange={(e) => { onChange(e.target.value); setPreview('') }}
        placeholder="https://imgur.com/your-image.png"
        className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#F5A623] transition-colors"
      />
    </div>
  )
}

/* ─── main page ─────────────────────────────────────────────── */
export default function TaskPage() {
  const params = useParams()
  const taskId = params.taskId as string

  const [data, setData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'learn' | 'submit'>('learn')
  const [submissionContent, setSubmissionContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitResult | null>(null)

  useEffect(() => {
    fetch(`/api/tasks/${taskId}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        // Pre-populate if already submitted
        if (d.userTask?.ai_feedback) setResult({
          gradingResult: d.userTask.ai_feedback,
          userTask: d.userTask,
          nextTaskId: d.nextTaskId,
          leveledUp: false,
          trackSlug: d.track.slug,
        })
      })
      .finally(() => setLoading(false))
  }, [taskId])

  const handleSubmit = async () => {
    if (!submissionContent.trim()) return
    setSubmitting(true)
    setResult(null)

    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submission_content: submissionContent }),
    })
    const json = await res.json()
    if (res.ok) {
      setResult(json)
      setActiveTab('submit')
    }
    setSubmitting(false)
  }

  const handleRetry = () => {
    setResult(null)
    setSubmissionContent('')
    setActiveTab('submit')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] px-4 pt-6 animate-pulse space-y-4">
        <div className="h-4 bg-zinc-800 rounded w-32" />
        <div className="h-8 bg-zinc-800 rounded w-3/4" />
        <div className="h-3 bg-zinc-800 rounded w-20" />
        <div className="h-40 bg-zinc-800 rounded-2xl mt-6" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <p className="text-zinc-400">Task not found.</p>
      </div>
    )
  }

  const { task, track, userTask } = data
  const isAlreadyPassed = userTask.status === 'approved'
  const attemptsLeft = 3 - (result?.userTask.attempts ?? userTask.attempts)

  const SubmitInput = () => {
    if (task.submission_type === 'text') return <TextInput value={submissionContent} onChange={setSubmissionContent} />
    if (task.submission_type === 'link') return <LinkInput value={submissionContent} onChange={setSubmissionContent} />
    if (task.submission_type === 'image') return <ImageInput value={submissionContent} onChange={setSubmissionContent} />
    return <LinkInput value={submissionContent} onChange={setSubmissionContent} />
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-28">
      {/* Top nav */}
      <div className="px-4 pt-5 pb-4">
        <Link href={`/tracks/${track._id}`} className="inline-flex items-center gap-1.5 text-zinc-500 text-xs mb-4 hover:text-zinc-300 transition-colors">
          <ArrowLeft size={14} /> {track.title}
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/20">
            Day {task.day_number} of {track.duration_days}
          </span>
          {isAlreadyPassed && (
            <span className="flex items-center gap-1 text-xs font-semibold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
              <CheckCircle2 size={11} /> Passed
            </span>
          )}
        </div>
        <h1 className="text-white text-2xl font-black leading-tight">{task.title}</h1>
        <div className="flex items-center gap-3 mt-2 text-zinc-500 text-xs">
          <span className="capitalize">{task.submission_type} submission</span>
          <span>·</span>
          <span className="text-[#F5A623]">+{task.xp_reward} XP</span>
          {task.naira_reward ? <><span>·</span><span className="text-green-400">+₦{task.naira_reward.toLocaleString()}</span></> : null}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 px-4 sticky top-0 bg-[#0A0A0A] z-20">
        {(['learn', 'submit'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-semibold border-b-2 capitalize transition-colors ${
              activeTab === tab
                ? 'border-[#F5A623] text-[#F5A623]'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab === 'learn' ? <BookOpen size={14} /> : <Send size={14} />}
            {tab}
          </button>
        ))}
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* LEARN tab */}
        {activeTab === 'learn' && (
          <>
            <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-white font-bold mb-3">What You&apos;ll Do</h2>
              <p className="text-zinc-300 text-sm leading-relaxed">{task.description}</p>
            </div>

            <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-white font-bold mb-3">Instructions</h2>
              <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{task.instructions}</div>
            </div>

            {/* Rubric */}
            <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-white font-bold mb-3">Grading Rubric</h2>
              <div className="space-y-2">
                {Object.entries(task.grading_rubric).map(([criterion, points]) => (
                  <div key={criterion} className="flex items-center justify-between py-2 border-b border-zinc-800/60 last:border-0">
                    <p className="text-zinc-300 text-sm capitalize">{criterion.replace(/_/g, ' ')}</p>
                    <span className="text-[#F5A623] font-bold text-sm">{points} pts</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-1">
                  <p className="text-white font-bold text-sm">Total</p>
                  <span className="text-[#F5A623] font-black">{task.max_score} pts</span>
                </div>
              </div>
            </div>

            {task.resources?.length > 0 && (
              <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5">
                <h2 className="text-white font-bold mb-3">Resources</h2>
                <div className="space-y-2">
                  {task.resources.map((r, i) => (
                    <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[#F5A623] text-sm hover:underline">
                      <ExternalLink size={14} /> {r.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setActiveTab('submit')}
              className="w-full bg-[#F5A623] text-black font-bold rounded-xl py-4 text-sm flex items-center justify-center gap-2"
            >
              I&apos;m ready — Submit My Work <ArrowRight size={16} />
            </button>
          </>
        )}

        {/* SUBMIT tab */}
        {activeTab === 'submit' && (
          <>
            {/* Grading result (if exists) */}
            {result && (
              <GradingResultCard
                result={result.gradingResult}
                attempts={result.userTask.attempts}
                nextTaskId={result.nextTaskId}
                trackId={track._id}
                leveledUp={result.leveledUp}
                onRetry={handleRetry}
              />
            )}

            {/* Submission form (hidden if passed) */}
            {!result?.gradingResult.passed && !isAlreadyPassed && (
              <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-bold">Your Submission</h2>
                  {userTask.attempts > 0 && !result && (
                    <span className="text-zinc-500 text-xs">{attemptsLeft} attempt{attemptsLeft === 1 ? '' : 's'} left</span>
                  )}
                </div>

                <SubmitInput />

                {/* Sending indicator */}
                {submitting && (
                  <div className="flex items-center gap-3 bg-[#F5A623]/10 border border-[#F5A623]/20 rounded-xl px-4 py-3">
                    <Loader2 size={16} className="text-[#F5A623] animate-spin flex-shrink-0" />
                    <div>
                      <p className="text-[#F5A623] text-sm font-semibold">Sending to AI grader…</p>
                      <p className="text-zinc-500 text-xs">This takes 5–10 seconds</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !submissionContent.trim()}
                  className="w-full bg-[#F5A623] hover:bg-[#e09610] text-black font-bold rounded-xl py-4 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {submitting ? 'Grading…' : 'Submit for Grading'}
                </button>

                <p className="text-zinc-600 text-xs text-center">
                  AI grades your work in seconds. Passing score is 60%.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
