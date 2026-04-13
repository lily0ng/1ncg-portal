'use client'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { Users, Plus, Trash2 } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function AffinityGroupsPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/compute/affinity-groups', fetcher)
  const groups = data?.groups || []

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Affinity Groups</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Control VM placement on hosts</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors text-sm">
          <Plus className="w-4 h-4" /> Create Group
        </button>
      </div>

      {isLoading && <div className="animate-pulse h-64 bg-white/5 rounded-xl" />}
      {error && <div className="text-red-400 text-sm">Failed to load. <button onClick={() => mutate()} className="underline">Retry</button></div>}

      {!isLoading && groups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="w-12 h-12 text-[var(--text-muted)] mb-4" />
          <p className="text-[var(--text-muted)]">No affinity groups</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Affinity groups control where VMs are placed</p>
        </div>
      )}

      <div className="space-y-3">
        {groups.map((g: any) => (
          <div key={g.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Users className="w-5 h-5 text-[var(--accent)]" />
              <div>
                <p className="text-sm font-medium text-[var(--text)]">{g.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{g.type} • {g.virtualmachineIds?.length || 0} VMs</p>
              </div>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 text-[var(--text-muted)] transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
