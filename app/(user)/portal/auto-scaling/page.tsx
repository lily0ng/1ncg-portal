'use client'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { TrendingUp, Plus, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function AutoScalingPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/network/autoscale-groups', fetcher)
  const groups = data?.groups || []

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Auto Scaling</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Automatically scale your instances based on demand</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => mutate()} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <RefreshCw className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors text-sm">
            <Plus className="w-4 h-4" /> Create Group
          </button>
        </div>
      </div>

      {isLoading && <div className="animate-pulse h-64 bg-white/5 rounded-xl" />}
      {error && <div className="text-red-400 text-sm">Failed to load. <button onClick={() => mutate()} className="underline">Retry</button></div>}

      {!isLoading && groups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TrendingUp className="w-12 h-12 text-[var(--text-muted)] mb-4" />
          <p className="text-[var(--text-muted)]">No auto scaling groups</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Create groups to automatically manage capacity</p>
        </div>
      )}

      <div className="space-y-3">
        {groups.map((g: any) => (
          <div key={g.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <TrendingUp className="w-5 h-5 text-[var(--accent)]" />
              <div>
                <p className="text-sm font-medium text-[var(--text)]">{g.name}</p>
                <p className="text-xs text-[var(--text-muted)]">Min: {g.minmembers} • Max: {g.maxmembers} • Current: {g.vmcount || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded-full ${g.state === 'enabled' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {g.state}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
