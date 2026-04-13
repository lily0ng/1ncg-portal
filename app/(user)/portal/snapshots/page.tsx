'use client'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { Camera, Trash2, RefreshCw } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function SnapshotsPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/storage/snapshots', fetcher)
  const snapshots = data?.snapshots || []

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Snapshots</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{snapshots.length} snapshot{snapshots.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => mutate()} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          <RefreshCw className="w-4 h-4 text-[var(--text-muted)]" />
        </button>
      </div>

      {isLoading && <div className="animate-pulse h-64 bg-white/5 rounded-xl" />}
      {error && <div className="text-red-400 text-sm">Failed to load. <button onClick={() => mutate()} className="underline">Retry</button></div>}

      {!isLoading && snapshots.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Camera className="w-12 h-12 text-[var(--text-muted)] mb-4" />
          <p className="text-[var(--text-muted)]">No snapshots yet</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Create snapshots from your volumes</p>
        </div>
      )}

      <div className="space-y-3">
        {snapshots.map((snap: any) => (
          <div key={snap.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Camera className="w-5 h-5 text-[var(--accent)]" />
              <div>
                <p className="text-sm font-medium text-[var(--text)]">{snap.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{snap.volumename} • {snap.created ? new Date(snap.created).toLocaleDateString() : '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded-full ${snap.state === 'BackedUp' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {snap.state}
              </span>
              <button className="p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 text-[var(--text-muted)] transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
