'use client'
import { useEffect, useState } from 'react'
import { Users, Briefcase, ArrowDownToLine, TrendingUp, UserPlus, BookOpen, Loader2 } from 'lucide-react'

interface Stats {
  total_users: number
  new_users_this_week: number
  open_gigs: number
  pending_withdrawals: { count: number; total_naira: number }
  total_withdrawn_naira: number
  platform_revenue_naira: number
  active_enrollments: number
  role_breakdown: Record<string, number>
}

function fmt(n: number) { return `₦${n.toLocaleString('en-NG')}` }

function StatCard({
  icon, label, value, sub, color = 'text-[#F5A623]',
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  color?: string
}) {
  return (
    <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-zinc-800/60 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      <p className="text-zinc-400 text-sm font-semibold mt-1">{label}</p>
      {sub && <p className="text-zinc-600 text-xs mt-0.5">{sub}</p>}
    </div>
  )
}

const ROLE_COLORS: Record<string, string> = {
  novice:     'bg-zinc-800 text-zinc-400',
  apprentice: 'bg-blue-400/10 text-blue-400',
  pro:        'bg-purple-400/10 text-purple-400',
  mentor:     'bg-[#F5A623]/10 text-[#F5A623]',
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load')
        return r.json()
      })
      .then(setStats)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={24} className="text-[#F5A623] animate-spin" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-400 text-sm">{error || 'Failed to load stats.'}</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-black">Overview</h1>
        <p className="text-zinc-500 text-sm mt-1">Platform health at a glance</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Users size={16} className="text-blue-400" />}
          label="Total Members"
          value={stats.total_users.toLocaleString()}
          sub={`+${stats.new_users_this_week} this week`}
          color="text-white"
        />
        <StatCard
          icon={<Briefcase size={16} className="text-green-400" />}
          label="Open Gigs"
          value={stats.open_gigs}
          color="text-green-400"
        />
        <StatCard
          icon={<ArrowDownToLine size={16} className="text-red-400" />}
          label="Pending Payouts"
          value={stats.pending_withdrawals.count}
          sub={fmt(stats.pending_withdrawals.total_naira)}
          color="text-red-400"
        />
        <StatCard
          icon={<TrendingUp size={16} className="text-[#F5A623]" />}
          label="Platform Revenue"
          value={fmt(stats.platform_revenue_naira)}
          color="text-[#F5A623]"
        />
        <StatCard
          icon={<BookOpen size={16} className="text-purple-400" />}
          label="Active Enrollments"
          value={stats.active_enrollments.toLocaleString()}
          color="text-purple-400"
        />
        <StatCard
          icon={<UserPlus size={16} className="text-zinc-400" />}
          label="Total Withdrawn"
          value={fmt(stats.total_withdrawn_naira)}
          color="text-zinc-300"
        />
      </div>

      {/* Role breakdown */}
      <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5">
        <h2 className="text-white font-bold text-sm mb-4">Member Breakdown by Role</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(stats.role_breakdown).map(([role, count]) => (
            <div
              key={role}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl ${ROLE_COLORS[role] ?? 'bg-zinc-800 text-zinc-400'}`}
            >
              <span className="text-xs font-black uppercase tracking-wide">{role}</span>
              <span className="text-lg font-black">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
