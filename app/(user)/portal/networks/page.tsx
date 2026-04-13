'use client'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { Network, Plus, RefreshCw, Wifi } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function NetworksPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/network/networks', fetcher)
  const networks = data?.networks || []

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Networks</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{networks.length} network{networks.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => mutate()} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <RefreshCw className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors text-sm">
            <Plus className="w-4 h-4" /> Create Network
          </button>
        </div>
      </div>

      {isLoading && <div className="animate-pulse h-64 bg-white/5 rounded-xl" />}
      {error && <div className="text-red-400 text-sm">Failed to load. <button onClick={() => mutate()} className="underline">Retry</button></div>}

      {!isLoading && networks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Network className="w-12 h-12 text-[var(--text-muted)] mb-4" />
          <p className="text-[var(--text-muted)]">No networks found</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {networks.map((n: any) => (
          <div key={n.id} className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-[var(--accent)]" />
                <div>
                  <h3 className="font-semibold text-[var(--text)] text-sm">{n.name}</h3>
                  <p className="text-xs text-[var(--text-muted)]">{n.type} • {n.zonename}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${n.state === 'Implemented' || n.state === 'Setup' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {n.state}
              </span>
            </div>
            <div className="text-xs text-[var(--text-muted)] space-y-1">
              {n.cidr && <p>CIDR: {n.cidr}</p>}
              {n.gateway && <p>Gateway: {n.gateway}</p>}
              {n.dns1 && <p>DNS: {n.dns1}</p>}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
