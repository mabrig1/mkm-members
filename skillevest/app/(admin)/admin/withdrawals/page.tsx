'use client'
import { useCallback, useEffect, useState } from 'react'
import { Loader2, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'

interface Withdrawal {
  _id: string
  user_id: { full_name: string; email: string } | null
  amount_naira: number
  bank_name: string
  account_number: string
  account_name: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  failure_reason?: string
  requested_at: string
  processed_at?: string
}

const STATUS_BADGE: Record<string, string> = {
  pending:    'text-yellow-400 bg-yellow-400/10',
  processing: 'text-blue-400 bg-blue-400/10',
  completed:  'text-green-400 bg-green-400/10',
  failed:     'text-red-400 bg-red-400/10',
}

function fmt(n: number) { return `₦${n.toLocaleString('en-NG')}` }

function FailModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void
  onConfirm: (reason: string) => void
}) {
  const [reason, setReason] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-[#111111] border border-zinc-800 rounded-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-white font-bold text-base">Mark as Failed</h2>
        <div>
          <label className="text-zinc-400 text-xs font-semibold block mb-1.5">Failure Reason</label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Invalid account number"
            className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-red-500 transition-colors"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-zinc-700 text-zinc-300 font-semibold rounded-xl py-2.5 text-sm">Cancel</button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim()}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white font-bold rounded-xl py-2.5 text-sm transition-colors"
          >
            Confirm Fail
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [updating, setUpdating] = useState<string | null>(null)
  const [failTarget, setFailTarget] = useState<string | null>(null)

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (statusFilter) params.set('status', statusFilter)
    const res = await fetch(`/api/admin/withdrawals?${params}`)
    const data = await res.json()
    setWithdrawals(data.withdrawals ?? [])
    setTotalPages(data.pagination?.pages ?? 1)
    setTotal(data.pagination?.total ?? 0)
    setLoading(false)
  }, [statusFilter, page])

  useEffect(() => { setPage(1) }, [statusFilter])
  useEffect(() => { fetchWithdrawals() }, [fetchWithdrawals])

  async function updateStatus(id: string, status: 'completed' | 'failed', failure_reason?: string) {
    setUpdating(id)
    setFailTarget(null)
    const res = await fetch(`/api/admin/withdrawals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, failure_reason }),
    })
    const data = await res.json()
    if (res.ok) {
      setWithdrawals((prev) => prev.map((w) => (w._id === id ? { ...w, ...data.withdrawal } : w)))
    }
    setUpdating(null)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-black">Withdrawals</h1>
        <p className="text-zinc-500 text-sm mt-1">{total.toLocaleString()} records</p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['pending', 'processing', 'completed', 'failed', ''].map((s) => (
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
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-sm">No withdrawals found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Member', 'Amount', 'Bank', 'Account', 'Status', 'Requested', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-zinc-500 text-xs font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {withdrawals.map((w) => (
                  <tr key={w._id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white font-semibold">{w.user_id?.full_name ?? '—'}</p>
                      <p className="text-zinc-600 text-xs">{w.user_id?.email ?? ''}</p>
                    </td>
                    <td className="px-4 py-3 text-[#F5A623] font-black whitespace-nowrap">{fmt(w.amount_naira)}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs whitespace-nowrap max-w-[140px] truncate">{w.bank_name}</td>
                    <td className="px-4 py-3">
                      <p className="text-zinc-300 font-mono text-xs">{w.account_number}</p>
                      <p className="text-zinc-600 text-xs truncate max-w-[120px]">{w.account_name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize ${STATUS_BADGE[w.status]}`}>
                          {w.status}
                        </span>
                        {w.failure_reason && (
                          <p className="text-red-400 text-[10px] mt-1 max-w-[120px] truncate">{w.failure_reason}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">
                      {new Date(w.requested_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      {(w.status === 'pending' || w.status === 'processing') && (
                        <div className="flex gap-1.5">
                          <button
                            disabled={updating === w._id}
                            onClick={() => updateStatus(w._id, 'completed')}
                            className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-40 whitespace-nowrap"
                          >
                            {updating === w._id
                              ? <Loader2 size={10} className="animate-spin" />
                              : <CheckCircle size={10} />}
                            Done
                          </button>
                          <button
                            disabled={updating === w._id}
                            onClick={() => setFailTarget(w._id)}
                            className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-40 whitespace-nowrap"
                          >
                            <XCircle size={10} /> Failed
                          </button>
                        </div>
                      )}
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

      {failTarget && (
        <FailModal
          onClose={() => setFailTarget(null)}
          onConfirm={(reason) => updateStatus(failTarget, 'failed', reason)}
        />
      )}
    </div>
  )
}
