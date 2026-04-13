'use client'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { Shield, RefreshCw, Download } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function BackupsPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/storage/backups', fetcher)
  const backups = data?.backups || []

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Backups</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{backups.length} backup{backups.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => mutate()} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          <RefreshCw className="w-4 h-4 text-[var(--text-muted)]" />
        </button>
      </div>

      {isLoading && <div className="animate-pulse h-64 bg-white/5 rounded-xl" />}
      {error && <div className="text-red-400 text-sm">Failed to load. <button onClick={() => mutate()} className="underline">Retry</button></div>}

      {!isLoading && backups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Shield className="w-12 h-12 text-[var(--text-muted)] mb-4" />
          <p className="text-[var(--text-muted)]">No backups found</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Backups protect your data from loss</p>
        </div>
      )}

      <div className="space-y-3">
        {backups.map((b: any) => (
          <div key={b.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="w-5 h-5 text-[var(--accent)]" />
              <div>
                <p className="text-sm font-medium text-[var(--text)]">{b.name || b.id}</p>
                <p className="text-xs text-[var(--text-muted)]">{b.type} • {b.created ? new Date(b.created).toLocaleDateString() : '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded-full ${b.status === 'backedup' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {b.status}
              </span>
              <button className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-muted)] transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
