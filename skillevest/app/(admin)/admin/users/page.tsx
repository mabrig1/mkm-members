'use client'
import { useCallback, useEffect, useState } from 'react'
import { Search, Crown, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'

interface User {
  _id: string
  full_name: string
  email: string
  role: string
  is_premium: boolean
  wallet_balance: number
  total_earned: number
  streak_days: number
  created_at: string
  university?: string
}

const ROLES = ['novice', 'apprentice', 'pro', 'mentor', 'admin']
const ROLE_FILTERS = ['', 'novice', 'apprentice', 'pro', 'mentor']

const ROLE_BADGE: Record<string, string> = {
  novice:     'bg-zinc-800 text-zinc-400',
  apprentice: 'bg-blue-400/10 text-blue-400',
  pro:        'bg-purple-400/10 text-purple-400',
  mentor:     'bg-[#F5A623]/10 text-[#F5A623]',
  admin:      'bg-red-400/10 text-red-400',
}

function fmt(n: number) { return `₦${n.toLocaleString('en-NG')}` }
function initials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (search) params.set('search', search)
    if (roleFilter) params.set('role', roleFilter)
    const res = await fetch(`/api/admin/users?${params}`)
    const data = await res.json()
    setUsers(data.users ?? [])
    setTotalPages(data.pagination?.pages ?? 1)
    setTotal(data.pagination?.total ?? 0)
    setLoading(false)
  }, [search, roleFilter, page])

  useEffect(() => { setPage(1) }, [search, roleFilter])
  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function updateUser(userId: string, patch: Record<string, unknown>) {
    setUpdating(userId)
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    const data = await res.json()
    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, ...data.user } : u)))
    }
    setUpdating(null)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-black">Users</h1>
        <p className="text-zinc-500 text-sm mt-1">{total.toLocaleString()} members total</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="w-full bg-[#111111] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#F5A623] transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {ROLE_FILTERS.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`text-xs font-semibold px-3 py-2 rounded-full transition-colors ${
                roleFilter === r
                  ? 'bg-[#F5A623] text-black'
                  : 'bg-[#111111] border border-zinc-800 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              {r || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111111] border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="text-[#F5A623] animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-sm">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Member', 'Role', 'Earned', 'Wallet', 'Streak', 'Joined', 'Premium', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-zinc-500 text-xs font-semibold uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-zinc-800/20 transition-colors">
                    {/* Member */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#F5A623]/10 flex items-center justify-center text-[#F5A623] text-xs font-black flex-shrink-0">
                          {initials(user.full_name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-semibold truncate max-w-[140px]">{user.full_name}</p>
                          <p className="text-zinc-600 text-xs truncate max-w-[140px]">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        disabled={updating === user._id}
                        onChange={(e) => updateUser(user._id, { role: e.target.value })}
                        className={`text-xs font-bold px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${ROLE_BADGE[user.role] ?? ROLE_BADGE.novice} uppercase tracking-wide`}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r} className="bg-[#111111] text-white normal-case">
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Earned */}
                    <td className="px-4 py-3 text-[#F5A623] font-bold whitespace-nowrap">
                      {fmt(user.total_earned)}
                    </td>

                    {/* Wallet */}
                    <td className="px-4 py-3 text-zinc-300 whitespace-nowrap">
                      {fmt(user.wallet_balance)}
                    </td>

                    {/* Streak */}
                    <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                      {user.streak_days}d
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3 text-zinc-500 whitespace-nowrap text-xs">
                      {new Date(user.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    {/* Premium */}
                    <td className="px-4 py-3">
                      <button
                        disabled={updating === user._id}
                        onClick={() => updateUser(user._id, { is_premium: !user.is_premium })}
                        className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full transition-colors ${
                          user.is_premium
                            ? 'bg-[#F5A623]/10 text-[#F5A623] hover:bg-[#F5A623]/20'
                            : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                        }`}
                      >
                        {updating === user._id
                          ? <Loader2 size={10} className="animate-spin" />
                          : <Crown size={10} />}
                        {user.is_premium ? 'Pro' : 'Free'}
                      </button>
                    </td>

                    {/* Spinner */}
                    <td className="px-4 py-3 w-8">
                      {updating === user._id && (
                        <Loader2 size={14} className="text-zinc-500 animate-spin" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
            <p className="text-zinc-500 text-xs">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg bg-zinc-800 disabled:opacity-40 flex items-center justify-center hover:bg-zinc-700 transition-colors"
              >
                <ChevronLeft size={14} className="text-zinc-300" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg bg-zinc-800 disabled:opacity-40 flex items-center justify-center hover:bg-zinc-700 transition-colors"
              >
                <ChevronRight size={14} className="text-zinc-300" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
