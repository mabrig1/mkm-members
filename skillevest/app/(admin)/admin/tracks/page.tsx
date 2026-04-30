'use client'
import { useCallback, useEffect, useState } from 'react'
import { Plus, Loader2, X, Eye, EyeOff } from 'lucide-react'

interface Track {
  _id: string
  title: string
  slug: string
  category: string
  difficulty: string
  is_premium: boolean
  is_published: boolean
  duration_days: number
  enrolled_count: number
  avg_earning_naira: number
  created_at: string
}

const CAT_BADGE: Record<string, string> = {
  copywriting:  'text-blue-400 bg-blue-400/10',
  design:       'text-purple-400 bg-purple-400/10',
  video:        'text-red-400 bg-red-400/10',
  social_media: 'text-pink-400 bg-pink-400/10',
  affiliate:    'text-green-400 bg-green-400/10',
  data_entry:   'text-zinc-400 bg-zinc-800',
}

const DIFF_BADGE: Record<string, string> = {
  beginner:     'text-emerald-400 bg-emerald-400/10',
  intermediate: 'text-yellow-400 bg-yellow-400/10',
  advanced:     'text-red-400 bg-red-400/10',
}

function fmt(n: number) { return `₦${n.toLocaleString('en-NG')}` }

const BLANK_FORM = {
  title: '', slug: '', category: 'copywriting', description: '',
  duration_days: 14, difficulty: 'beginner', is_premium: false, avg_earning_naira: 0,
}

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (t: Track) => void }) {
  const [form, setForm] = useState(BLANK_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(key: string, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function submit() {
    if (!form.title || !form.slug || !form.description) {
      setError('Title, slug and description are required.')
      return
    }
    setSaving(true)
    setError('')
    const res = await fetch('/api/admin/tracks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Failed to create'); setSaving(false); return }
    onCreated(data.track)
    onClose()
  }

  const inputCls = 'w-full bg-[#0A0A0A] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#F5A623] transition-colors'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-[#111111] border border-zinc-800 rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-white font-black text-lg">New Track</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors"><X size={20} /></button>
        </div>

        {[
          { label: 'Title', key: 'title', placeholder: 'Cold Email Copywriting' },
          { label: 'Slug', key: 'slug', placeholder: 'cold-email-copywriting' },
          { label: 'Description', key: 'description', placeholder: 'Short description shown on cards' },
        ].map(({ label, key, placeholder }) => (
          <div key={key}>
            <label className="text-zinc-400 text-xs font-semibold block mb-1.5">{label}</label>
            <input
              value={form[key as keyof typeof form] as string}
              onChange={(e) => set(key, e.target.value)}
              placeholder={placeholder}
              className={inputCls}
            />
          </div>
        ))}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-zinc-400 text-xs font-semibold block mb-1.5">Category</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls}>
              {['copywriting', 'design', 'video', 'social_media', 'affiliate', 'data_entry'].map((c) => (
                <option key={c} value={c}>{c.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-zinc-400 text-xs font-semibold block mb-1.5">Difficulty</label>
            <select value={form.difficulty} onChange={(e) => set('difficulty', e.target.value)} className={inputCls}>
              {['beginner', 'intermediate', 'advanced'].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-zinc-400 text-xs font-semibold block mb-1.5">Duration (days)</label>
            <input type="number" min={1} value={form.duration_days} onChange={(e) => set('duration_days', parseInt(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label className="text-zinc-400 text-xs font-semibold block mb-1.5">Avg Earning (₦/mo)</label>
            <input type="number" min={0} value={form.avg_earning_naira} onChange={(e) => set('avg_earning_naira', parseInt(e.target.value))} className={inputCls} />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_premium} onChange={(e) => set('is_premium', e.target.checked)} className="accent-[#F5A623] w-4 h-4" />
          <span className="text-zinc-300 text-sm font-semibold">Premium track</span>
        </label>

        {error && <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

        <button
          onClick={submit}
          disabled={saving}
          className="w-full bg-[#F5A623] hover:bg-[#e09610] disabled:opacity-60 text-black font-black rounded-xl py-3 transition-colors"
        >
          {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Create Track (Unpublished)'}
        </button>
      </div>
    </div>
  )
}

export default function AdminTracksPage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)
  const [filter, setFilter] = useState('')

  const fetchTracks = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter) params.set('published', filter)
    const res = await fetch(`/api/admin/tracks?${params}`)
    const data = await res.json()
    setTracks(data.tracks ?? [])
    setLoading(false)
  }, [filter])

  useEffect(() => { fetchTracks() }, [fetchTracks])

  async function togglePublish(track: Track) {
    setToggling(track._id)
    const res = await fetch(`/api/admin/tracks/${track._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !track.is_published }),
    })
    const data = await res.json()
    if (res.ok) setTracks((prev) => prev.map((t) => (t._id === track._id ? { ...t, ...data.track } : t)))
    setToggling(null)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-black">Tracks</h1>
          <p className="text-zinc-500 text-sm mt-1">{tracks.length} tracks total</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[#F5A623] hover:bg-[#e09610] text-black font-bold text-sm px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={15} /> New Track
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5">
        {[{ label: 'All', value: '' }, { label: 'Published', value: 'true' }, { label: 'Draft', value: 'false' }].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`text-xs font-semibold px-3 py-2 rounded-full transition-colors ${
              filter === f.value ? 'bg-[#F5A623] text-black' : 'bg-[#111111] border border-zinc-800 text-zinc-400 hover:border-zinc-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-[#111111] border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="text-[#F5A623] animate-spin" />
          </div>
        ) : tracks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-sm">No tracks found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Track', 'Category', 'Difficulty', 'Duration', 'Enrolled', 'Avg Earning', 'Status', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-zinc-500 text-xs font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {tracks.map((track) => (
                  <tr key={track._id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white font-semibold max-w-[200px] truncate">{track.title}</p>
                      <p className="text-zinc-600 text-xs">{track.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${CAT_BADGE[track.category] ?? CAT_BADGE.data_entry}`}>
                        {track.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${DIFF_BADGE[track.difficulty]}`}>
                        {track.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">{track.duration_days}d</td>
                    <td className="px-4 py-3 text-zinc-300">{track.enrolled_count.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[#F5A623] font-bold whitespace-nowrap">{fmt(track.avg_earning_naira)}/mo</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        track.is_published ? 'text-green-400 bg-green-400/10' : 'text-zinc-500 bg-zinc-800'
                      }`}>
                        {track.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        disabled={toggling === track._id}
                        onClick={() => togglePublish(track)}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors disabled:opacity-40 whitespace-nowrap"
                      >
                        {toggling === track._id
                          ? <Loader2 size={12} className="animate-spin" />
                          : track.is_published ? <EyeOff size={12} /> : <Eye size={12} />}
                        {track.is_published ? 'Unpublish' : 'Publish'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={(t) => { setTracks((prev) => [t, ...prev]); setShowCreate(false) }}
        />
      )}
    </div>
  )
}
