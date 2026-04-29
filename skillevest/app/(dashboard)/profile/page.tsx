'use client'
import { useEffect, useState } from 'react'
import {
  Star, CheckCircle, Copy, Check, Share2, ExternalLink,
  Pencil, Loader2, X, Users, Zap, Briefcase, BookOpen, Crown,
} from 'lucide-react'

/* ─── types ─────────────────────────────────────────────────── */
interface ProfileData {
  _id: string
  full_name: string
  email: string
  phone?: string
  whatsapp_optin?: boolean
  role: string
  level: number
  xp_points: number
  streak_days: number
  wallet_balance: number
  total_earned: number
  referral_code: string
  is_premium?: boolean
  fiverr_username?: string
  upwork_profile_url?: string
  goal?: string
  state?: string
  created_at: string
}

interface Stats {
  tasks_completed: number
  gigs_completed: number
  referred_count: number
  tracks_completed: number
}

interface CompletedTrack {
  _id: string
  title: string
  category: string
}

/* ─── constants ─────────────────────────────────────────────── */
const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  novice:     { bg: 'bg-zinc-800', text: 'text-zinc-400' },
  apprentice: { bg: 'bg-blue-400/10', text: 'text-blue-400' },
  pro:        { bg: 'bg-purple-400/10', text: 'text-purple-400' },
  mentor:     { bg: 'bg-[#F5A623]/10', text: 'text-[#F5A623]' },
}

const CAT_COLOR: Record<string, string> = {
  copywriting: 'text-blue-400 bg-blue-400/10',
  design: 'text-purple-400 bg-purple-400/10',
  social_media: 'text-pink-400 bg-pink-400/10',
  data_entry: 'text-zinc-400 bg-zinc-800',
  affiliate: 'text-green-400 bg-green-400/10',
}

/* ─── helpers ───────────────────────────────────────────────── */
function fmt(n: number) { return `₦${n.toLocaleString('en-NG')}` }
function initials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}
function memberSince(d: string) {
  return new Date(d).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })
}
function xpToNextLevel(xp: number, level: number) {
  const thresholds = [0, 200, 800, 2000, 5000, Infinity]
  const current = thresholds[level - 1] ?? 0
  const next = thresholds[level] ?? 5000
  if (next === Infinity) return { pct: 100, remaining: 0 }
  const pct = Math.min(100, Math.round(((xp - current) / (next - current)) * 100))
  return { pct, remaining: next - xp }
}

/* ─── edit modal ─────────────────────────────────────────────── */
function EditModal({ profile, onClose, onSave }: {
  profile: ProfileData
  onClose: () => void
  onSave: (updated: Partial<ProfileData>) => void
}) {
  const [fullName, setFullName] = useState(profile.full_name)
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [fiverr, setFiverr] = useState(profile.fiverr_username ?? '')
  const [upwork, setUpwork] = useState(profile.upwork_profile_url ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    if (!fullName.trim()) { setError('Name is required'); return }
    setSaving(true)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
        fiverr_username: fiverr.trim() || undefined,
        upwork_profile_url: upwork.trim() || undefined,
      }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Update failed'); setSaving(false); return }
    onSave(data.profile)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-[#111111] border border-zinc-800 rounded-t-3xl sm:rounded-2xl p-6 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-white font-black text-lg">Edit Profile</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors"><X size={20} /></button>
        </div>

        {[
          { label: 'Full Name', value: fullName, set: setFullName, placeholder: 'Your full name' },
          { label: 'Phone', value: phone, set: setPhone, placeholder: '08012345678' },
          { label: 'Fiverr Username', value: fiverr, set: setFiverr, placeholder: 'yourusername' },
          { label: 'Upwork Profile URL', value: upwork, set: setUpwork, placeholder: 'https://www.upwork.com/freelancers/~...' },
        ].map(({ label, value, set, placeholder }) => (
          <div key={label}>
            <label className="text-zinc-400 text-xs font-semibold block mb-1.5">{label}</label>
            <input
              value={value}
              onChange={e => set(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#F5A623] transition-colors"
            />
          </div>
        ))}

        {error && <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

        <button
          onClick={save}
          disabled={saving}
          className="w-full bg-[#F5A623] hover:bg-[#e09610] disabled:opacity-60 text-black font-black rounded-xl py-3.5 transition-colors"
        >
          {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

/* ─── copy button ────────────────────────────────────────────── */
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="text-zinc-500 hover:text-[#F5A623] transition-colors">
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
    </button>
  )
}

/* ─── stat card ──────────────────────────────────────────────── */
function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-4 flex flex-col gap-2">
      <div className="text-zinc-500">{icon}</div>
      <p className="text-white font-black text-xl leading-none">{value}</p>
      <p className="text-zinc-500 text-xs">{label}</p>
    </div>
  )
}

/* ─── main page ─────────────────────────────────────────────── */
export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [tracks, setTracks] = useState<CompletedTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [profileUrl, setProfileUrl] = useState('')

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(d => {
        setProfile(d.profile)
        setStats(d.stats)
        setTracks(d.completed_tracks ?? [])
        setLoading(false)
        setProfileUrl(`${window.location.origin}/p/${d.profile.referral_code}`)
      })
  }, [])

  function shareProfile() {
    if (navigator.share) {
      navigator.share({ title: 'My SkillVest Profile', url: profileUrl })
    } else {
      navigator.clipboard.writeText(profileUrl)
    }
  }

  function shareReferral() {
    const msg = `Join SkillVest and earn real income while learning digital skills! Use my referral code: ${profile?.referral_code}\n\nSign up: ${window.location.origin}/register?ref=${profile?.referral_code}`
    if (navigator.share) {
      navigator.share({ text: msg })
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] pb-24 px-4">
        <div className="pt-6 space-y-4 animate-pulse">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 rounded-full bg-zinc-800" />
            <div className="space-y-2">
              <div className="h-5 bg-zinc-800 rounded w-32" />
              <div className="h-3 bg-zinc-800 rounded w-20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-zinc-800 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!profile) return null

  const role = ROLE_COLORS[profile.role] ?? ROLE_COLORS.novice
  const { pct, remaining } = xpToNextLevel(profile.xp_points, profile.level)

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-[#F5A623]/10 border-2 border-[#F5A623]/30 flex items-center justify-center text-[#F5A623] font-black text-xl">
                {initials(profile.full_name)}
              </div>
              {profile.is_premium && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#F5A623] flex items-center justify-center">
                  <Crown size={10} className="text-black" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-white font-black text-xl leading-tight">{profile.full_name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${role.bg} ${role.text}`}>
                  {profile.role}
                </span>
                <span className="text-zinc-600 text-xs">Lv.{profile.level}</span>
              </div>
              <p className="text-zinc-600 text-xs mt-1">Member since {memberSince(profile.created_at)}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={shareProfile}
              className="w-9 h-9 rounded-xl bg-[#111111] border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
            >
              <Share2 size={15} />
            </button>
            <button
              onClick={() => setShowEdit(true)}
              className="w-9 h-9 rounded-xl bg-[#111111] border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
            >
              <Pencil size={15} />
            </button>
          </div>
        </div>

        {/* XP bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-zinc-500 text-xs">{profile.xp_points.toLocaleString()} XP</span>
            {profile.level < 5 ? (
              <span className="text-zinc-600 text-xs">{remaining.toLocaleString()} XP to Lv.{profile.level + 1}</span>
            ) : (
              <span className="text-[#F5A623] text-xs font-bold">Max Level</span>
            )}
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#F5A623] to-[#e09610] rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="px-4 grid grid-cols-2 gap-3 mb-4">
        <StatCard icon={<Zap size={16} />} label="Total Earned" value={fmt(profile.total_earned)} />
        <StatCard icon={<Briefcase size={16} />} label="Gigs Completed" value={stats?.gigs_completed ?? 0} />
        <StatCard icon={<BookOpen size={16} />} label="Tasks Done" value={stats?.tasks_completed ?? 0} />
        <StatCard icon={<Star size={16} className="fill-[#F5A623] text-[#F5A623]" />} label="Day Streak" value={`${profile.streak_days}d`} />
      </div>

      {/* Completed tracks / skill badges */}
      {tracks.length > 0 && (
        <div className="px-4 mb-4">
          <h2 className="text-white font-bold text-sm mb-3">Verified Skills</h2>
          <div className="flex flex-wrap gap-2">
            {tracks.map(t => (
              <span
                key={t._id}
                className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full ${CAT_COLOR[t.category] ?? 'text-zinc-400 bg-zinc-800'}`}
              >
                <CheckCircle size={10} />
                {t.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* External links */}
      {(profile.fiverr_username || profile.upwork_profile_url) && (
        <div className="px-4 mb-4">
          <h2 className="text-white font-bold text-sm mb-3">Freelance Profiles</h2>
          <div className="space-y-2">
            {profile.fiverr_username && (
              <a
                href={`https://www.fiverr.com/${profile.fiverr_username}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 bg-[#111111] border border-zinc-800 rounded-xl px-4 py-3 hover:border-zinc-600 transition-colors"
              >
                <span className="text-green-400 font-black text-sm">f</span>
                <span className="text-white text-sm flex-1">@{profile.fiverr_username}</span>
                <ExternalLink size={14} className="text-zinc-500" />
              </a>
            )}
            {profile.upwork_profile_url && (
              <a
                href={profile.upwork_profile_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 bg-[#111111] border border-zinc-800 rounded-xl px-4 py-3 hover:border-zinc-600 transition-colors"
              >
                <span className="text-green-600 font-black text-sm">U</span>
                <span className="text-white text-sm flex-1 truncate">Upwork Profile</span>
                <ExternalLink size={14} className="text-zinc-500" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Referral section */}
      <div className="px-4 mb-4">
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-sm">Referrals</h2>
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
              <Users size={12} />
              <span>{stats?.referred_count ?? 0} joined</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#0A0A0A] border border-zinc-800 rounded-xl px-3 py-2.5">
            <span className="text-[#F5A623] font-black text-sm tracking-widest flex-1">{profile.referral_code}</span>
            <CopyButton value={profile.referral_code} />
          </div>

          <button
            onClick={shareReferral}
            className="w-full flex items-center justify-center gap-2 bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] font-bold text-sm rounded-xl py-2.5 hover:bg-[#25D366]/20 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.374 0 0 5.373 0 12c0 2.127.558 4.17 1.62 5.97L0 24l6.187-1.59A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.894 0-3.7-.502-5.277-1.383l-.379-.225-3.674.944.98-3.565-.247-.389A9.935 9.935 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            Share on WhatsApp
          </button>
        </div>
      </div>

      {/* Account info */}
      <div className="px-4 mb-4">
        <h2 className="text-white font-bold text-sm mb-3">Account</h2>
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl divide-y divide-zinc-800">
          {[
            { label: 'Email', value: profile.email },
            { label: 'Phone', value: profile.phone ?? 'Not set' },
            { label: 'State', value: profile.state ?? 'Not set' },
            { label: 'WhatsApp Notifications', value: profile.whatsapp_optin ? 'Enabled' : 'Disabled' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center px-4 py-3">
              <span className="text-zinc-500 text-sm">{label}</span>
              <span className="text-zinc-300 text-sm font-medium">{value}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowEdit(true)}
          className="w-full mt-3 border border-zinc-800 text-zinc-400 text-sm font-semibold rounded-xl py-3 hover:border-zinc-600 hover:text-zinc-300 transition-colors"
        >
          Edit Profile
        </button>
      </div>

      {showEdit && (
        <EditModal
          profile={profile}
          onClose={() => setShowEdit(false)}
          onSave={(updated) => setProfile(prev => prev ? { ...prev, ...updated } : prev)}
        />
      )}
    </div>
  )
}
