'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import { Plus, Pencil, Trash2, AlertTriangle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function ClustersPage() {
  const { data, error, isLoading, mutate } = useSWR('/api/infrastructure/clusters', fetcher)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const clusters = data?.clusters || []

  async function handleDelete(cluster: any) {
    if (!confirm(`Delete cluster "${cluster.name}"?`)) return
    setActionLoading(cluster.id)
    try {
      const res = await fetch(`/api/infrastructure/clusters/${cluster.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Cluster deleted')
      mutate()
    } catch {
      toast.error('Failed to delete cluster')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Clusters"
          description="Manage infrastructure clusters"
          action={
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors text-sm">
              <Plus className="w-4 h-4" />
              Add Cluster
            </button>
          }
        />
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">Failed to load clusters.</p>
          <button onClick={() => mutate()} className="ml-auto flex items-center gap-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 px-3 py-1.5 rounded-lg transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-white/5 rounded" />
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Zone</th>
                <th className="px-4 py-3 text-left">Pod</th>
                <th className="px-4 py-3 text-left">Hypervisor</th>
                <th className="px-4 py-3 text-left">Cluster Type</th>
                <th className="px-4 py-3 text-left">State</th>
                <th className="px-4 py-3 text-right">Hosts</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {clusters.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-500">No clusters found</td></tr>
              )}
              {clusters.map((cluster: any) => (
                <tr key={cluster.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-white">{cluster.name}</p>
                      <p className="text-xs text-slate-500">{cluster.id}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{cluster.zonename || '-'}</td>
                  <td className="px-4 py-3 text-slate-300">{cluster.podname || '-'}</td>
                  <td className="px-4 py-3">
                    {cluster.hypervisortype && (
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">{cluster.hypervisortype}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{cluster.clustertype || '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={cluster.allocationstate?.toLowerCase() || 'unknown'} /></td>
                  <td className="px-4 py-3 text-right text-slate-300">{cluster.hosts ?? '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toast.info('Edit cluster - coming soon')}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cluster)}
                        disabled={actionLoading === cluster.id}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </motion.div>
  )
}
