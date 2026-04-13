'use client'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { Image, RefreshCw, Plus } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function TemplatesPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/images/templates?templatefilter=self', fetcher)
  const templates = data?.templates || []

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Templates</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{templates.length} template{templates.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => mutate()} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <RefreshCw className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors text-sm">
            <Plus className="w-4 h-4" /> Register
          </button>
        </div>
      </div>

      {isLoading && <div className="animate-pulse h-64 bg-white/5 rounded-xl" />}
      {error && <div className="text-red-400 text-sm">Failed to load. <button onClick={() => mutate()} className="underline">Retry</button></div>}

      {!isLoading && templates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Image className="w-12 h-12 text-[var(--text-muted)] mb-4" />
          <p className="text-[var(--text-muted)]">No custom templates</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Create templates from your instances</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((t: any) => (
          <div key={t.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/20 flex items-center justify-center">
                <Image className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--text)] truncate">{t.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{t.ostypename}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">{t.size ? `${(t.size / (1024**3)).toFixed(1)} GB` : '—'}</span>
              <span className={`px-2 py-0.5 rounded-full ${t.isready ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {t.isready ? 'Ready' : 'Processing'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
