'use client'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { ArrowLeft, Box, Play, Square, Download } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function KubernetesDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const { data, isLoading, mutate } = useSWR(`/api/kubernetes/clusters/${id}`, fetcher)
  const cluster = data?.cluster

  async function doAction(action: string) {
    await fetch(`/api/kubernetes/clusters/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) })
    mutate()
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-[var(--text-muted)]" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">{isLoading ? '...' : cluster?.name || 'Cluster Detail'}</h1>
          <p className="text-sm text-[var(--text-muted)]">{cluster?.id}</p>
        </div>
      </div>

      {isLoading && <div className="animate-pulse h-64 bg-white/5 rounded-xl" />}

      {cluster && (
        <>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-[var(--text)]">Actions</h2>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => doAction('start')} disabled={cluster.state === 'Running'} className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm">
                <Play className="w-4 h-4" /> Start
              </button>
              <button onClick={() => doAction('stop')} disabled={cluster.state === 'Stopped'} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm">
                <Square className="w-4 h-4" /> Stop
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm">
                <Download className="w-4 h-4" /> Download Kubeconfig
              </button>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-[var(--text)]">Cluster Details</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {[
                ['Zone', cluster.zonename],
                ['Kubernetes Version', cluster.kubernetesversion],
                ['Network', cluster.networkname],
                ['Control Nodes', cluster.controlnodes],
                ['Worker Nodes', cluster.size],
                ['vCPUs', cluster.cpunumber],
                ['Memory', cluster.memory ? `${(cluster.memory/1024).toFixed(0)} GB` : '—'],
                ['State', cluster.state],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between py-2 border-b border-white/5">
                  <dt className="text-[var(--text-muted)]">{k}</dt>
                  <dd className="text-[var(--text)] font-medium">{v || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>
        </>
      )}
    </motion.div>
  )
}
