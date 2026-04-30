'use client'
import { useCallback, useEffect, useState } from 'react'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'

interface Gig {
  _id: string
  title: string
  category: string
  budget_naira: number
  platform_fee_naira: number
  status: string
  deadline_hours: number
  escrow_held: boolean
  client_id: { full_name: string; email: string } | null
  assigned_to: { full_name: string; email: string } | null
  created_at: string
}

const STATUSES = ['', 'open', 'assigned', 'submitted', 'in_review', 'approved', 'disputed', 'paid', 'cancelled']

const STATUS_BADGE: Record<string, string> = {
  open:      'text-green-400 bg-green-400/10',
  assigned:  'text-blue-400 bg-blue-400/10',
  submitted: 'text-yellow-400 bg-yellow-400/10',
  in_review: 'text-orange-400 bg-orange-400/10',
  approved:  'text-emerald-400 bg-emerald-400/10',
  disputed:  'text-red-400 bg-red-400/10',
  paid:      'text-[#F5A623] bg-[#F5A623]/10',
  cancelled: 'text-zinc-500 bg-zinc-800',
}

const CAT_BADGE: Record<string, string> = {
  copywriting:  'text-blue-400 bg-blue-400/10',
  design:       'text-purple-400 bg-purple-400/10',
  video:        'text-red-400 bg-red-400/10',
  social_media: 'text-pink-400 bg-pink-400/10',
  affiliate:    'text-green-400 bg-green-400/10',
  data_entry:   'text-zinc-400 bg-zinc-800',
}

function fmt(n: number) { return `₦${n.toLocaleString('en-NG')}` }

const NEXT_STATUS: Record<string, { label: string; next: string }[]> = {
  submitted:  [{ label: 'Mark In Review', next: 'in_review' }],
  in_review:  [{ label: 'Approve', next: 'approved' }, { label: 'Dispute', next: 'disputed' }],
  approved:   [{ label: 'Pay Out', next: 'paid' }],
  disputed:   [{ label: 'Approve', next: 'approved' }, { label: 'Cancel', next: 'cancelled' }],
  open:       [{ label: 'Cancel', next: 'cancelled' }],
}

export default function AdminGigsPage() {
  const [gigs, setGigs] = useState<Gig[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchGigs = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (statusFilter) params.set('status', statusFilter)
    const res = await fetch(`/api/admin/gigs?${params}`)
    const data = await res.json()
    setGigs(data.gigs ?? [])
    setTotalPages(data.pagination?.pages ?? 1)
    setTotal(data.pagination?.total ?? 0)
    setLoading(false)
  }, [statusFilter, page])

  useEffect(() => { setPage(1) }, [statusFilter])
  useEffect(() => { fetchGigs() }, [fetchGigs])

  async function updateStatus(gigId: string, status: string) {
    setUpdating(gigId)
    const res = await fetch(`/api/admin/gigs/${gigId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const data = await res.json()
    if (res.ok) setGigs((prev) => prev.map((g) => (g._id === gigId ? { ...g, ...data.gig } : g)))
    setUpdating(null)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-black">Gigs</h1>
        <p className="text-zinc-500 text-sm mt-1">{total.toLocaleString()} gigs total</p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-xs font-semibold px-3 py-2 rounded-full transition-colors capitalize ${
              statusFilter === s ? 'bg-[#F5A623] text-black' : 'bg-[#111111] border border-zinc-800 text-zinc-400 hover:border-zinc-600'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-[#111111] border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="text-[#F5A623] animate-spin" />
          </div>
        ) : gigs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-sm">No gigs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Title', 'Category', 'Budget', 'Status', 'Client', 'Assigned To', 'Escrow', 'Posted', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-zinc-500 text-xs font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {gigs.map((gig) => (
                  <tr key={gig._id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="text-white font-semibold truncate">{gig.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${CAT_BADGE[gig.category] ?? CAT_BADGE.data_entry}`}>
                        {gig.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#F5A623] font-bold whitespace-nowrap">{fmt(gig.budget_naira)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize ${STATUS_BADGE[gig.status] ?? STATUS_BADGE.cancelled}`}>
                        {gig.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs whitespace-nowrap">
                      {gig.client_id?.full_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs whitespace-nowrap">
                      {gig.assigned_to?.full_name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${gig.escrow_held ? 'text-emerald-400 bg-emerald-400/10' : 'text-zinc-500 bg-zinc-800'}`}>
                        {gig.escrow_held ? 'Held' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">
                      {new Date(gig.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {(NEXT_STATUS[gig.status] ?? []).map(({ label, next }) => (
                          <button
                            key={next}
                            disabled={updating === gig._id}
                            onClick={() => updateStatus(gig._id, next)}
                            className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors disabled:opacity-40 whitespace-nowrap flex items-center gap-1"
                          >
                            {updating === gig._id && <Loader2 size={10} className="animate-spin" />}
                            {label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
            <p className="text-zinc-500 text-xs">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded-lg bg-zinc-800 disabled:opacity-40 flex items-center justify-center hover:bg-zinc-700 transition-colors">
                <ChevronLeft size={14} className="text-zinc-300" />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 rounded-lg bg-zinc-800 disabled:opacity-40 flex items-center justify-center hover:bg-zinc-700 transition-colors">
                <ChevronRight size={14} className="text-zinc-300" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
