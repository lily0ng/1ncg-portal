'use client'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { Cpu, Plus, RefreshCw } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function VNFAppliancesPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/compute/vnf-appliances', fetcher)
  const appliances = data?.appliances || []

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">VNF Appliances</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Virtual Network Function appliances</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => mutate()} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <RefreshCw className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors text-sm">
            <Plus className="w-4 h-4" /> Deploy Appliance
          </button>
        </div>
      </div>

      {isLoading && <div className="animate-pulse h-64 bg-white/5 rounded-xl" />}
      {error && <div className="text-red-400 text-sm">Failed to load. <button onClick={() => mutate()} className="underline">Retry</button></div>}

      {!isLoading && appliances.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Cpu className="w-12 h-12 text-[var(--text-muted)] mb-4" />
          <p className="text-[var(--text-muted)]">No VNF appliances deployed</p>
        </div>
      )}

      <div className="space-y-3">
        {appliances.map((a: any) => (
          <div key={a.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Cpu className="w-5 h-5 text-[var(--accent)]" />
              <div>
                <p className="text-sm font-medium text-[var(--text)]">{a.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{a.zonename} • {a.state}</p>
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${a.state === 'Running' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
              {a.state}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
