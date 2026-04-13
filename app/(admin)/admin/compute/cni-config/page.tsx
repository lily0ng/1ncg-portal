'use client'

import useSWR from 'swr'
import { motion } from 'framer-motion'
import { Info, Network } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface KubernetesCluster {
  id: string
  name: string
  networkname?: string
  zonename?: string
  state?: string
  cniPlugin?: string
}

export default function CNIConfigPage() {
  const { data, error, isLoading, mutate } = useSWR('/api/compute/kubernetes', fetcher)

  const clusters: KubernetesCluster[] = data?.kubernetesClusters || data?.clusters || []

  const getCNIPlugin = (cluster: KubernetesCluster) => cluster.cniPlugin || 'Flannel'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader title="CNI Configuration" description="Container Network Interface configuration for Kubernetes clusters" />

      <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-blue-300 text-sm">
          Container Network Interface (CNI) configuration for Kubernetes clusters. The CNI plugin defines how networking is implemented within each cluster.
        </p>
      </div>

      {isLoading && (
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-white/5 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-40" />
              <div className="h-4 bg-white/10 rounded w-32" />
              <div className="h-4 bg-white/10 rounded w-24" />
              <div className="h-4 bg-white/10 rounded w-20" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-center">
          <p className="text-red-400 mb-3">Failed to load Kubernetes clusters</p>
          <button onClick={() => mutate()} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && clusters.length === 0 && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-12 text-center">
          <Network className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-white/60 text-lg font-medium mb-2">No Kubernetes Clusters</h3>
          <p className="text-white/40 text-sm">Deploy a Kubernetes cluster to manage CNI configuration here.</p>
        </div>
      )}

      {!isLoading && !error && clusters.length > 0 && (
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-white/60 text-sm font-medium">Cluster Name</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Network</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">CNI Plugin</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Zone</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">State</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clusters.map(cluster => (
                <tr key={cluster.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <p className="text-white font-medium">{cluster.name}</p>
                    <p className="text-xs text-white/40">{cluster.id}</p>
                  </td>
                  <td className="p-4 text-white/60 text-sm">{cluster.networkname || '-'}</td>
                  <td className="p-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">{getCNIPlugin(cluster)}</span>
                  </td>
                  <td className="p-4 text-white/60 text-sm">{cluster.zonename || '-'}</td>
                  <td className="p-4">
                    <StatusBadge status={cluster.state || 'unknown'} />
                  </td>
                  <td className="p-4">
                    <button className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 text-white/60 rounded-lg transition-colors">
                      View Config
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  )
}
