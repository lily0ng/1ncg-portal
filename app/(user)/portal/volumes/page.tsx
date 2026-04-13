'use client'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { HardDrive, Plus, RefreshCw } from 'lucide-react'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then(r => r.json())

function formatSize(gb: number) {
  return gb >= 1024 ? `${(gb/1024).toFixed(1)} TB` : `${gb} GB`
}

export default function VolumesPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/storage/volumes', fetcher)
  const volumes = data?.volumes || []

  const stateColor: Record<string, string> = {
    Ready: 'bg-green-500/20 text-green-400',
    Allocated: 'bg-blue-500/20 text-blue-400',
    Uploading: 'bg-yellow-500/20 text-yellow-400',
    Destroy: 'bg-red-500/20 text-red-400',
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Volumes</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{volumes.length} volume{volumes.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => mutate()} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <RefreshCw className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors text-sm">
            <Plus className="w-4 h-4" /> Create Volume
          </button>
        </div>
      </div>

      {isLoading && <div className="animate-pulse h-64 bg-white/5 rounded-xl" />}
      {error && <div className="text-red-400 text-sm">Failed to load. <button onClick={() => mutate()} className="underline">Retry</button></div>}

      {!isLoading && volumes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <HardDrive className="w-12 h-12 text-[var(--text-muted)] mb-4" />
          <p className="text-[var(--text-muted)]">No volumes</p>
        </div>
      )}

      <div className="space-y-3">
        {volumes.map((v: any) => (
          <Link key={v.id} href={`/portal/volumes/${v.id}`}>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <HardDrive className="w-5 h-5 text-[var(--accent)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">{v.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {v.type} • {formatSize(v.size / (1024**3))} • {v.zonename}
                    {v.vmname ? ` • Attached to ${v.vmname}` : ' • Detached'}
                  </p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${stateColor[v.state] || 'bg-gray-500/20 text-gray-400'}`}>
                {v.state}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  )
}
