'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Wallet, ArrowDownLeft, ArrowUpRight, Crown, ChevronDown,
  X, CheckCircle, AlertCircle, Loader2, Copy, Check,
} from 'lucide-react'

/* ─── types ─────────────────────────────────────────────────── */
interface Transaction {
  _id: string
  type: 'gig_earning' | 'withdrawal' | 'subscription' | 'deposit'
  amount_naira: number
  status: 'completed' | 'pending' | 'failed'
  description: string
  created_at: string
}

interface WalletData {
  wallet_balance: number
  total_earned: number
  is_premium: boolean
  premium_expires_at: string | null
  transactions: Transaction[]
  pagination: { page: number; limit: number; total: number; pages: number }
}

interface Bank { code: string; name: string }

/* ─── helpers ───────────────────────────────────────────────── */
function fmt(n: number) { return `₦${n.toLocaleString('en-NG')}` }
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

const TX_TABS = [
  { label: 'All', value: '' },
  { label: 'Earnings', value: 'gig_earning' },
  { label: 'Withdrawals', value: 'withdrawal' },
  { label: 'Subscriptions', value: 'subscription' },
]

function txIcon(type: string) {
  if (type === 'gig_earning') return <ArrowDownLeft size={14} className="text-green-400" />
  if (type === 'withdrawal') return <ArrowUpRight size={14} className="text-red-400" />
  if (type === 'subscription') return <Crown size={14} className="text-[#F5A623]" />
  return <Wallet size={14} className="text-zinc-400" />
}

function txAmountColor(type: string) {
  if (type === 'gig_earning') return 'text-green-400'
  if (type === 'withdrawal') return 'text-red-400'
  return 'text-zinc-300'
}

/* ─── withdraw modal ─────────────────────────────────────────── */
function WithdrawModal({ balance, onClose, onSuccess }: {
  balance: number
  onClose: () => void
  onSuccess: (amount: number) => void
}) {
  const [step, setStep] = useState<'form' | 'confirm' | 'done'>('form')
  const [amount, setAmount] = useState('')
  const [banks, setBanks] = useState<Bank[]>([])
  const [bankCode, setBankCode] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [resolving, setResolving] = useState(false)
  const [resolveError, setResolveError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const resolveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch('/api/wallet/banks').then(r => r.json()).then(d => setBanks(d.banks ?? []))
  }, [])

  useEffect(() => {
    if (accountNumber.length === 10 && bankCode) {
      setAccountName('')
      setResolveError('')
      setResolving(true)
      if (resolveTimer.current) clearTimeout(resolveTimer.current)
      resolveTimer.current = setTimeout(async () => {
        const res = await fetch(`/api/wallet/resolve-account?account_number=${accountNumber}&bank_code=${bankCode}`)
        const data = await res.json()
        if (data.account_name) setAccountName(data.account_name)
        else setResolveError('Could not verify account. Check number and bank.')
        setResolving(false)
      }, 500)
    } else {
      setAccountName('')
      setResolveError('')
    }
  }, [accountNumber, bankCode])

  const amountNum = parseFloat(amount) || 0
  const canProceed = amountNum >= 1000 && amountNum <= balance && bankCode && accountNumber.length === 10 && accountName

  async function submit() {
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/wallet/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount_naira: amountNum, bank_code: bankCode, account_number: accountNumber, account_name: accountName }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Withdrawal failed'); setSubmitting(false); return }
    setStep('done')
    setSubmitting(false)
    onSuccess(amountNum)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-[#111111] border border-zinc-800 rounded-t-3xl sm:rounded-2xl p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-white font-black text-lg">
            {step === 'done' ? 'Withdrawal Initiated' : 'Withdraw Funds'}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        {step === 'form' && (
          <>
            {/* Amount */}
            <div>
              <label className="text-zinc-400 text-xs font-semibold block mb-2">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F5A623] font-black text-lg">₦</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="1,000"
                  className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-xl pl-8 pr-4 py-3 text-white text-lg font-bold outline-none focus:border-[#F5A623] transition-colors"
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-zinc-600 text-xs">Min ₦1,000</span>
                <button
                  onClick={() => setAmount(String(balance))}
                  className="text-[#F5A623] text-xs font-semibold"
                >
                  Max: {fmt(balance)}
                </button>
              </div>
              {amountNum > 0 && amountNum < 1000 && (
                <p className="text-red-400 text-xs mt-1">Minimum withdrawal is ₦1,000</p>
              )}
              {amountNum > balance && (
                <p className="text-red-400 text-xs mt-1">Amount exceeds your balance</p>
              )}
            </div>

            {/* Bank */}
            <div>
              <label className="text-zinc-400 text-xs font-semibold block mb-2">Bank</label>
              <div className="relative">
                <select
                  value={bankCode}
                  onChange={e => setBankCode(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#F5A623] transition-colors appearance-none"
                >
                  <option value="">Select your bank</option>
                  {banks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            {/* Account number */}
            <div>
              <label className="text-zinc-400 text-xs font-semibold block mb-2">Account Number</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="0123456789"
                className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#F5A623] transition-colors font-mono"
              />
              {resolving && (
                <p className="text-zinc-500 text-xs mt-1 flex items-center gap-1">
                  <Loader2 size={10} className="animate-spin" /> Verifying account...
                </p>
              )}
              {accountName && (
                <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                  <CheckCircle size={10} /> {accountName}
                </p>
              )}
              {resolveError && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={10} /> {resolveError}
                </p>
              )}
            </div>

            {error && <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

            <button
              onClick={() => setStep('confirm')}
              disabled={!canProceed}
              className="w-full bg-[#F5A623] hover:bg-[#e09610] disabled:opacity-40 disabled:cursor-not-allowed text-black font-black rounded-xl py-3.5 transition-colors"
            >
              Continue
            </button>
          </>
        )}

        {step === 'confirm' && (
          <>
            <div className="bg-[#0A0A0A] border border-zinc-800 rounded-xl p-4 space-y-3">
              {[
                ['Amount', fmt(amountNum)],
                ['To', accountName],
                ['Account', accountNumber],
                ['Bank', banks.find(b => b.code === bankCode)?.name ?? bankCode],
                ['You receive', fmt(amountNum)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-zinc-500 text-sm">{label}</span>
                  <span className="text-white text-sm font-semibold">{value}</span>
                </div>
              ))}
            </div>
            <p className="text-zinc-600 text-xs text-center">Processing takes 1–3 business days</p>
            {error && <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setStep('form')} className="flex-1 border border-zinc-700 text-zinc-300 font-semibold rounded-xl py-3 text-sm">
                Edit
              </button>
              <button
                onClick={submit}
                disabled={submitting}
                className="flex-1 bg-[#F5A623] hover:bg-[#e09610] disabled:opacity-60 text-black font-black rounded-xl py-3 text-sm transition-colors"
              >
                {submitting ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Confirm Withdrawal'}
              </button>
            </div>
          </>
        )}

        {step === 'done' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-400/10 flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <div>
              <p className="text-white font-black text-xl">{fmt(amountNum)}</p>
              <p className="text-zinc-400 text-sm mt-1">Withdrawal initiated to {accountName}</p>
            </div>
            <p className="text-zinc-600 text-xs">Funds arrive within 1–3 business days</p>
            <button onClick={onClose} className="w-full bg-[#111111] border border-zinc-800 text-zinc-300 font-semibold rounded-xl py-3 text-sm">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── main page ─────────────────────────────────────────────── */
export default function WalletPage() {
  const [data, setData] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)
  const [txType, setTxType] = useState('')
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [allTx, setAllTx] = useState<Transaction[]>([])
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [balance, setBalance] = useState(0)

  const fetchWallet = useCallback(async (p = 1, append = false) => {
    if (!append) setLoading(true)
    else setLoadingMore(true)

    const params = new URLSearchParams({ page: String(p) })
    if (txType) params.set('type', txType)

    const res = await fetch(`/api/wallet?${params}`)
    const d = await res.json()

    setData(d)
    setBalance(d.wallet_balance ?? 0)
    setAllTx(prev => append ? [...prev, ...(d.transactions ?? [])] : (d.transactions ?? []))
    setLoading(false)
    setLoadingMore(false)
  }, [txType])

  useEffect(() => { setPage(1); setAllTx([]); fetchWallet(1) }, [fetchWallet])

  function loadMore() {
    const next = page + 1
    setPage(next)
    fetchWallet(next, true)
  }

  async function handleSubscribe() {
    const res = await fetch('/api/payments/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount_naira: 1500, type: 'subscription' }),
    })
    const d = await res.json()
    if (d.authorization_url) window.location.href = d.authorization_url
  }

  const hasMore = data ? page < data.pagination.pages : false
  const isPremium = data?.is_premium ?? false

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-white text-2xl font-black">Wallet</h1>
        <p className="text-zinc-500 text-sm">Your earnings and payouts</p>
      </div>

      {/* Balance card */}
      <div className="mx-4 mb-4">
        <div className="bg-gradient-to-br from-[#1a1400] to-[#111111] border border-[#F5A623]/20 rounded-2xl p-6">
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wide mb-1">Available Balance</p>
          {loading ? (
            <div className="h-10 bg-zinc-800 rounded animate-pulse w-40 mb-4" />
          ) : (
            <p className="text-[#F5A623] font-black text-4xl leading-none mb-4">{fmt(balance)}</p>
          )}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-600 text-xs">Total Earned</p>
              <p className="text-zinc-300 text-sm font-bold">{loading ? '—' : fmt(data?.total_earned ?? 0)}</p>
            </div>
            <button
              onClick={() => setShowWithdraw(true)}
              disabled={balance < 1000}
              className="bg-[#F5A623] hover:bg-[#e09610] disabled:opacity-40 disabled:cursor-not-allowed text-black font-black text-sm px-5 py-2.5 rounded-xl transition-colors"
            >
              Withdraw
            </button>
          </div>
          {balance < 1000 && !loading && (
            <p className="text-zinc-600 text-xs mt-2">Min ₦1,000 to withdraw</p>
          )}
        </div>
      </div>

      {/* Premium card */}
      {!isPremium && !loading && (
        <div className="mx-4 mb-4">
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#F5A623]/10 flex items-center justify-center flex-shrink-0">
              <Crown size={18} className="text-[#F5A623]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">Unlock Premium</p>
              <p className="text-zinc-500 text-xs">Higher gig limits, priority support, verified badge</p>
            </div>
            <button
              onClick={handleSubscribe}
              className="flex-shrink-0 bg-[#F5A623] text-black font-black text-xs px-3 py-2 rounded-xl"
            >
              ₦1,500/mo
            </button>
          </div>
        </div>
      )}

      {isPremium && data?.premium_expires_at && (
        <div className="mx-4 mb-4">
          <div className="bg-[#F5A623]/5 border border-[#F5A623]/20 rounded-2xl p-4 flex items-center gap-3">
            <Crown size={16} className="text-[#F5A623] flex-shrink-0" />
            <p className="text-[#F5A623] text-xs font-semibold">
              Premium active · renews {formatDate(data.premium_expires_at)}
            </p>
          </div>
        </div>
      )}

      {/* Transaction history */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-base">Transactions</h2>
        </div>

        {/* Tab filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-3">
          {TX_TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setTxType(t.value)}
              className={`flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-full transition-colors ${
                txType === t.value
                  ? 'bg-[#F5A623] text-black'
                  : 'bg-[#111111] border border-zinc-800 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-[#111111] border border-zinc-800 rounded-xl p-4 animate-pulse flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-zinc-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-zinc-800 rounded w-3/4" />
                  <div className="h-2 bg-zinc-800 rounded w-1/3" />
                </div>
                <div className="h-4 bg-zinc-800 rounded w-16" />
              </div>
            ))}
          </div>
        ) : allTx.length === 0 ? (
          <div className="text-center py-12">
            <Wallet size={32} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">No transactions yet</p>
            <p className="text-zinc-600 text-xs mt-1">Complete gigs to start earning</p>
          </div>
        ) : (
          <div className="space-y-2">
            {allTx.map(tx => (
              <div key={tx._id} className="bg-[#111111] border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800/60 flex items-center justify-center flex-shrink-0">
                  {txIcon(tx.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{tx.description}</p>
                  <p className="text-zinc-600 text-xs">{formatDate(tx.created_at)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-black ${txAmountColor(tx.type)}`}>
                    {tx.type === 'withdrawal' ? '-' : '+'}{fmt(tx.amount_naira)}
                  </p>
                  <p className={`text-[10px] font-semibold capitalize ${
                    tx.status === 'completed' ? 'text-green-400' :
                    tx.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                  }`}>{tx.status}</p>
                </div>
              </div>
            ))}

            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full border border-zinc-800 text-zinc-400 text-sm font-semibold rounded-xl py-3 mt-2 hover:border-zinc-600 transition-colors disabled:opacity-50"
              >
                {loadingMore ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Load more'}
              </button>
            )}
          </div>
        )}
      </div>

      {showWithdraw && (
        <WithdrawModal
          balance={balance}
          onClose={() => setShowWithdraw(false)}
          onSuccess={(amount) => {
            setBalance(b => b - amount)
            setShowWithdraw(false)
            setAllTx([])
            setPage(1)
            fetchWallet(1)
          }}
        />
      )}
    </div>
  )
}
