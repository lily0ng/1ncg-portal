'use client'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import { Box, Plus, RefreshCw, ExternalLink } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function KubernetesPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/kubernetes/clusters', fetcher)
  const clusters = data?.clusters || []

  const stateColor: Record<string, string> = {
    Running: 'bg-green-500/20 text-green-400',
    Stopped: 'bg-gray-500/20 text-gray-400',
    Starting: 'bg-yellow-500/20 text-yellow-400',
    Error: 'bg-red-500/20 text-red-400',
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Kubernetes Clusters</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{clusters.length} cluster{clusters.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => mutate()} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <RefreshCw className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors text-sm">
            <Plus className="w-4 h-4" /> Create Cluster
          </button>
        </div>
      </div>

      {isLoading && <div className="animate-pulse h-64 bg-white/5 rounded-xl" />}
      {error && <div className="text-red-400 text-sm">Failed to load. <button onClick={() => mutate()} className="underline">Retry</button></div>}

      {!isLoading && clusters.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Box className="w-12 h-12 text-[var(--text-muted)] mb-4" />
          <p className="text-[var(--text-muted)]">No Kubernetes clusters</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Deploy managed Kubernetes clusters</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clusters.map((c: any) => (
          <motion.div key={c.id} whileHover={{ y: -2 }} className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Box className="w-8 h-8 text-[var(--accent)]" />
                <div>
                  <h3 className="font-semibold text-[var(--text)]">{c.name}</h3>
                  <p className="text-xs text-[var(--text-muted)]">{c.zonename} • k8s {c.kubernetesversion}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${stateColor[c.state] || 'bg-gray-500/20 text-gray-400'}`}>
                {c.state}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-[var(--text)] font-bold">{c.size || 0}</p>
                <p className="text-[var(--text-muted)]">Nodes</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-[var(--text)] font-bold">{c.cpunumber || 0}</p>
                <p className="text-[var(--text-muted)]">vCPUs</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-[var(--text)] font-bold">{c.memory ? `${(c.memory/1024).toFixed(0)}G` : '—'}</p>
                <p className="text-[var(--text-muted)]">Memory</p>
              </div>
            </div>
            <a href={`/portal/kubernetes/${c.id}`} className="flex items-center gap-1 text-xs text-[var(--accent)] hover:underline">
              View Details <ExternalLink className="w-3 h-3" />
            </a>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
