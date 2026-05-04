'use client'
import { useCallback, useEffect, useState } from 'react'
import {
  Users, Briefcase, BookOpen, Wallet, TrendingUp, CheckCircle,
  XCircle, Eye, ChevronDown, Search, RefreshCw, Loader2,
  ShieldAlert, ToggleLeft, ToggleRight, AlertTriangle,
} from 'lucide-react'

/* ─── types ─────────────────────────────────────────────────── */
interface Stats {
  total_users: number
  active_today: number
  monthly_volume: number
  platform_fees: number
  open_gigs: number
  pending_withdrawals: number
  pending_withdrawal_amount: number
}

interface User {
  _id: string
  full_name: string
  email: string
  role: string
  level: number
  xp_points: number
  total_earned: number
  wallet_balance: number
  created_at: string
  suspended?: boolean
}

interface Gig {
  _id: string
  title: string
  status: string
  budget_naira: number
  category: string
  client_id: { full_name: string; email: string } | null
  assigned_to: { full_name: string; email: string } | null
  created_at: string
}

interface TrackItem {
  _id: string
  title: string
  category: string
  is_published: boolean
  task_count: number
  enrolled_count: number
  difficulty: string
}

interface Withdrawal {
  _id: string
  amount_naira: number
  bank_name: string
  account_number: string
  account_name: string
  status: string
  requested_at: string
  user_id: { full_name: string; email: string }
}

/* ─── helpers ───────────────────────────────────────────────── */
function fmt(n: number) { return `₦${n.toLocaleString('en-NG')}` }
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

const TABS = ['Overview', 'Users', 'Gigs', 'Tracks', 'Withdrawals'] as const
type Tab = typeof TABS[number]

const ROLE_COLORS: Record<string, string> = {
  novice: 'text-zinc-400 bg-zinc-800',
  apprentice: 'text-blue-400 bg-blue-400/10',
  pro: 'text-purple-400 bg-purple-400/10',
  mentor: 'text-[#F5A623] bg-[#F5A623]/10',
  admin: 'text-red-400 bg-red-400/10',
}

const GIG_STATUS_COLOR: Record<string, string> = {
  open: 'text-green-400 bg-green-400/10',
  assigned: 'text-blue-400 bg-blue-400/10',
  submitted: 'text-yellow-400 bg-yellow-400/10',
  approved: 'text-[#F5A623] bg-[#F5A623]/10',
  closed: 'text-zinc-500 bg-zinc-800',
  disputed: 'text-red-400 bg-red-400/10',
}

/* ─── stat card ─────────────────────────────────────────────── */
function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 text-zinc-500 mb-3">{icon}<span className="text-xs font-semibold uppercase tracking-wide">{label}</span></div>
      <p className="text-white font-black text-2xl leading-none">{value}</p>
      {sub && <p className="text-zinc-600 text-xs mt-1">{sub}</p>}
    </div>
  )
}

/* ─── confirm dialog ─────────────────────────────────────────── */
function Confirm({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#111111] border border-zinc-700 rounded-2xl p-6 max-w-sm w-full space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-[#F5A623] flex-shrink-0 mt-0.5" />
          <p className="text-white text-sm">{message}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 border border-zinc-700 text-zinc-300 text-sm font-semibold rounded-xl py-2.5">Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-[#F5A623] text-black text-sm font-black rounded-xl py-2.5">Confirm</button>
        </div>
      </div>
    </div>
  )
}

/* ─── main admin page ────────────────────────────────────────── */
export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('Overview')
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [userTotal, setUserTotal] = useState(0)
  const [userPage, setUserPage] = useState(1)
  const [userQ, setUserQ] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('')
  const [gigs, setGigs] = useState<Gig[]>([])
  const [gigStatus, setGigStatus] = useState('')
  const [tracks, setTracks] = useState<TrackItem[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [wdStatus, setWdStatus] = useState('pending')
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  /* ── fetch functions ── */
  const fetchStats = useCallback(async () => {
    const res = await fetch('/api/admin/stats')
    setStats(await res.json())
  }, [])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(userPage) })
    if (userQ) params.set('q', userQ)
    if (userRoleFilter) params.set('role', userRoleFilter)
    const res = await fetch(`/api/admin/users?${params}`)
    const d = await res.json()
    setUsers(d.users ?? [])
    setUserTotal(d.total ?? 0)
    setLoading(false)
  }, [userPage, userQ, userRoleFilter])

  const fetchGigs = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (gigStatus) params.set('status', gigStatus)
    const res = await fetch(`/api/admin/gigs?${params}`)
    const d = await res.json()
    setGigs(d.gigs ?? [])
    setLoading(false)
  }, [gigStatus])

  const fetchTracks = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/tracks')
    const d = await res.json()
    setTracks(d.tracks ?? [])
    setLoading(false)
  }, [])

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/withdrawals?status=${wdStatus}`)
    const d = await res.json()
    setWithdrawals(d.withdrawals ?? [])
    setLoading(false)
  }, [wdStatus])

  useEffect(() => { fetchStats() }, [fetchStats])
  useEffect(() => { if (tab === 'Users') fetchUsers() }, [tab, fetchUsers])
  useEffect(() => { if (tab === 'Gigs') fetchGigs() }, [tab, fetchGigs])
  useEffect(() => { if (tab === 'Tracks') fetchTracks() }, [tab, fetchTracks])
  useEffect(() => { if (tab === 'Withdrawals') fetchWithdrawals() }, [tab, fetchWithdrawals])

  /* ── action helpers ── */
  async function userAction(userId: string, action: string, role?: string) {
    setActionLoading(userId + action)
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, action, role }),
    })
    setActionLoading(null)
    fetchUsers()
  }

  async function gigAction(gigId: string, action: string) {
    setActionLoading(gigId + action)
    await fetch('/api/admin/gigs', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gig_id: gigId, action }),
    })
    setActionLoading(null)
    fetchGigs()
    fetchStats()
  }

  async function trackAction(trackId: string, action: string) {
    setActionLoading(trackId + action)
    await fetch('/api/admin/tracks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ track_id: trackId, action }),
    })
    setActionLoading(null)
    fetchTracks()
  }

  async function wdAction(wdId: string, action: string, reason?: string) {
    setActionLoading(wdId + action)
    await fetch('/api/admin/withdrawals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ withdrawal_id: wdId, action, reject_reason: reason }),
    })
    setActionLoading(null)
    fetchWithdrawals()
    fetchStats()
  }

  function ask(message: string, onConfirm: () => void) {
    setConfirm({ message, onConfirm })
  }

  /* ── render ── */
  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-12">
      {confirm && (
        <Confirm
          message={confirm.message}
          onConfirm={() => { confirm.onConfirm(); setConfirm(null) }}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Tab bar */}
      <div className="flex gap-1 px-6 pt-6 pb-4 overflow-x-auto scrollbar-hide border-b border-zinc-800">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-shrink-0 text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
              tab === t ? 'bg-[#F5A623] text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="px-6 pt-6">

        {/* ── OVERVIEW ── */}
        {tab === 'Overview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-white font-black text-xl">Platform Overview</h1>
              <button onClick={fetchStats} className="text-zinc-500 hover:text-zinc-300">
                <RefreshCw size={16} />
              </button>
            </div>
            {!stats ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="h-28 bg-zinc-900 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<Users size={16} />} label="Total Users" value={stats.total_users.toLocaleString()} />
                <StatCard icon={<TrendingUp size={16} />} label="Active Today" value={stats.active_today.toLocaleString()} />
                <StatCard icon={<Wallet size={16} />} label="Monthly Volume" value={fmt(stats.monthly_volume)} />
                <StatCard icon={<TrendingUp size={16} />} label="Platform Fees" value={fmt(stats.platform_fees)} sub="this month" />
                <StatCard icon={<Briefcase size={16} />} label="Open Gigs" value={stats.open_gigs} />
                <StatCard icon={<Wallet size={16} />} label="Pending Withdrawals" value={stats.pending_withdrawals} sub={fmt(stats.pending_withdrawal_amount)} />
              </div>
            )}
          </div>
        )}

        {/* ── USERS ── */}
        {tab === 'Users' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-48">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  value={userQ}
                  onChange={e => { setUserQ(e.target.value); setUserPage(1) }}
                  placeholder="Search name or email…"
                  className="w-full bg-[#111111] border border-zinc-800 rounded-xl pl-8 pr-4 py-2.5 text-white text-sm outline-none focus:border-zinc-600"
                />
              </div>
              <div className="relative">
                <select
                  value={userRoleFilter}
                  onChange={e => { setUserRoleFilter(e.target.value); setUserPage(1) }}
                  className="bg-[#111111] border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-300 text-sm outline-none appearance-none pr-8"
                >
                  <option value="">All roles</option>
                  {['novice', 'apprentice', 'pro', 'mentor'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
              <p className="text-zinc-500 text-sm">{userTotal} users</p>
            </div>

            {loading ? (
              <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-14 bg-zinc-900 rounded-xl animate-pulse" />)}</div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-zinc-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-[#111111]">
                      {['Name', 'Email', 'Role', 'Level', 'Earned', 'Joined', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-zinc-500 text-xs font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {users.map(u => (
                      <tr key={u._id} className={`hover:bg-zinc-900/50 ${u.suspended ? 'opacity-50' : ''}`}>
                        <td className="px-4 py-3 text-white font-semibold whitespace-nowrap">{u.full_name}</td>
                        <td className="px-4 py-3 text-zinc-400 text-xs">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${ROLE_COLORS[u.role] ?? ROLE_COLORS.novice}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-300 text-xs">Lv.{u.level}</td>
                        <td className="px-4 py-3 text-[#F5A623] font-bold text-xs whitespace-nowrap">{fmt(u.total_earned)}</td>
                        <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">{fmtDate(u.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {/* Role picker */}
                            <select
                              defaultValue={u.role}
                              onChange={e => ask(
                                `Change ${u.full_name}'s role to "${e.target.value}"?`,
                                () => userAction(u._id, 'change_role', e.target.value)
                              )}
                              className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-2 py-1 outline-none"
                            >
                              {['novice', 'apprentice', 'pro', 'mentor', 'admin'].map(r => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                            {/* Suspend toggle */}
                            <button
                              onClick={() => ask(
                                u.suspended
                                  ? `Unsuspend ${u.full_name}?`
                                  : `Suspend ${u.full_name}? They will lose access.`,
                                () => userAction(u._id, u.suspended ? 'unsuspend' : 'suspend')
                              )}
                              className="text-zinc-500 hover:text-red-400 transition-colors"
                              title={u.suspended ? 'Unsuspend' : 'Suspend'}
                            >
                              {actionLoading === u._id + (u.suspended ? 'unsuspend' : 'suspend')
                                ? <Loader2 size={14} className="animate-spin" />
                                : u.suspended ? <ToggleLeft size={18} /> : <ToggleRight size={18} />
                              }
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="flex gap-2">
              <button disabled={userPage === 1} onClick={() => setUserPage(p => p - 1)} className="px-3 py-1.5 text-xs text-zinc-400 bg-zinc-800 rounded-lg disabled:opacity-40">← Prev</button>
              <button onClick={() => setUserPage(p => p + 1)} className="px-3 py-1.5 text-xs text-zinc-400 bg-zinc-800 rounded-lg">Next →</button>
            </div>
          </div>
        )}

        {/* ── GIGS ── */}
        {tab === 'Gigs' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <select
                  value={gigStatus}
                  onChange={e => setGigStatus(e.target.value)}
                  className="bg-[#111111] border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-300 text-sm outline-none appearance-none pr-8"
                >
                  <option value="">All statuses</option>
                  {['open', 'assigned', 'submitted', 'approved', 'closed', 'disputed'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
              <button onClick={fetchGigs} className="text-zinc-500 hover:text-zinc-300"><RefreshCw size={14} /></button>
            </div>

            {loading ? (
              <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 bg-zinc-900 rounded-xl animate-pulse" />)}</div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-zinc-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-[#111111]">
                      {['Title', 'Status', 'Budget', 'Client', 'Worker', 'Posted', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-zinc-500 text-xs font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {gigs.map(g => (
                      <tr key={g._id} className="hover:bg-zinc-900/50">
                        <td className="px-4 py-3 text-white font-semibold max-w-xs truncate">{g.title}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${GIG_STATUS_COLOR[g.status] ?? ''}`}>
                            {g.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#F5A623] font-bold text-xs whitespace-nowrap">{fmt(g.budget_naira)}</td>
                        <td className="px-4 py-3 text-zinc-400 text-xs whitespace-nowrap">{g.client_id?.full_name ?? '—'}</td>
                        <td className="px-4 py-3 text-zinc-400 text-xs whitespace-nowrap">{g.assigned_to?.full_name ?? '—'}</td>
                        <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">{fmtDate(g.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {g.status === 'open' && (
                              <button
                                onClick={() => ask(`Close gig "${g.title}"?`, () => gigAction(g._id, 'close'))}
                                className="text-xs text-red-400 hover:text-red-300 font-semibold"
                              >
                                Close
                              </button>
                            )}
                            {g.status === 'submitted' && (
                              <button
                                onClick={() => ask(`Release escrow for "${g.title}"? This will pay the worker.`, () => gigAction(g._id, 'release_escrow'))}
                                className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 font-semibold"
                              >
                                {actionLoading === g._id + 'release_escrow'
                                  ? <Loader2 size={12} className="animate-spin" />
                                  : <><CheckCircle size={12} /> Release</>
                                }
                              </button>
                            )}
                            <a href={`/gigs/${g._id}`} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-zinc-300">
                              <Eye size={14} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TRACKS ── */}
        {tab === 'Tracks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-base">Track Management</h2>
              <button onClick={fetchTracks} className="text-zinc-500 hover:text-zinc-300"><RefreshCw size={14} /></button>
            </div>

            {loading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-zinc-900 rounded-2xl animate-pulse" />)}</div>
            ) : (
              <div className="space-y-3">
                {tracks.map(t => (
                  <div key={t._id} className="bg-[#111111] border border-zinc-800 rounded-2xl px-5 py-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-bold text-sm truncate">{t.title}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${t.is_published ? 'text-green-400 bg-green-400/10' : 'text-zinc-500 bg-zinc-800'}`}>
                          {t.is_published ? 'Live' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-zinc-500 text-xs capitalize">{t.category} · {t.difficulty} · {t.task_count} tasks · {t.enrolled_count} enrolled</p>
                    </div>
                    <button
                      onClick={() => ask(
                        t.is_published
                          ? `Unpublish "${t.title}"? Students won't see it.`
                          : `Publish "${t.title}"? It will be visible to all users.`,
                        () => trackAction(t._id, t.is_published ? 'unpublish' : 'publish')
                      )}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-colors ${
                        t.is_published
                          ? 'bg-red-400/10 text-red-400 hover:bg-red-400/20'
                          : 'bg-green-400/10 text-green-400 hover:bg-green-400/20'
                      }`}
                    >
                      {actionLoading === t._id + (t.is_published ? 'unpublish' : 'publish')
                        ? <Loader2 size={12} className="animate-spin" />
                        : t.is_published ? <><ToggleRight size={14} /> Unpublish</> : <><ToggleLeft size={14} /> Publish</>
                      }
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── WITHDRAWALS ── */}
        {tab === 'Withdrawals' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {['pending', 'completed', 'failed'].map(s => (
                  <button
                    key={s}
                    onClick={() => setWdStatus(s)}
                    className={`text-xs font-semibold px-3 py-2 rounded-full capitalize transition-colors ${
                      wdStatus === s ? 'bg-[#F5A623] text-black' : 'bg-[#111111] border border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button onClick={fetchWithdrawals} className="text-zinc-500 hover:text-zinc-300"><RefreshCw size={14} /></button>
            </div>

            {loading ? (
              <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 bg-zinc-900 rounded-xl animate-pulse" />)}</div>
            ) : withdrawals.length === 0 ? (
              <div className="text-center py-12">
                <ShieldAlert size={28} className="text-zinc-700 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">No {wdStatus} withdrawals</p>
              </div>
            ) : (
              <div className="space-y-3">
                {withdrawals.map(w => (
                  <div key={w._id} className="bg-[#111111] border border-zinc-800 rounded-2xl px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm">{w.user_id?.full_name ?? '—'}</p>
                        <p className="text-zinc-500 text-xs">{w.user_id?.email ?? '—'}</p>
                        <p className="text-zinc-400 text-xs mt-1">
                          {w.bank_name} · {w.account_number} · {w.account_name}
                        </p>
                        <p className="text-zinc-600 text-xs mt-0.5">{fmtDate(w.requested_at)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[#F5A623] font-black text-lg leading-none">{fmt(w.amount_naira)}</p>
                        {w.status === 'pending' && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => ask(
                                `Reject withdrawal of ${fmt(w.amount_naira)} for ${w.user_id?.full_name}? Balance will be restored.`,
                                () => wdAction(w._id, 'reject', 'Rejected by admin')
                              )}
                              className="flex items-center gap-1 text-xs text-red-400 bg-red-400/10 hover:bg-red-400/20 font-bold px-3 py-1.5 rounded-lg transition-colors"
                            >
                              {actionLoading === w._id + 'reject' ? <Loader2 size={12} className="animate-spin" /> : <><XCircle size={12} /> Reject</>}
                            </button>
                            <button
                              onClick={() => ask(
                                `Approve and send ${fmt(w.amount_naira)} to ${w.account_name} via ${w.bank_name}?`,
                                () => wdAction(w._id, 'approve')
                              )}
                              className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 hover:bg-green-400/20 font-bold px-3 py-1.5 rounded-lg transition-colors"
                            >
                              {actionLoading === w._id + 'approve' ? <Loader2 size={12} className="animate-spin" /> : <><CheckCircle size={12} /> Approve</>}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
