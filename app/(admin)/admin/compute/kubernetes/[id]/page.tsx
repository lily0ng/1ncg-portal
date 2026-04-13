'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import * as Tabs from '@radix-ui/react-tabs'
import { toast } from 'sonner'
import { ArrowLeft, Download, Copy, AlertCircle, RefreshCw, Container, Terminal } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface KubernetesCluster {
  id: string
  name: string
  state: string
  kubernetesversion?: string
  size?: number
  workernodes?: number
  masternodes?: number
  zonename?: string
  zoneid?: string
  endpoint?: string
  ipaddress?: string
  created?: string
  account?: string
  domain?: string
  cidr?: string
  networkname?: string
  keypair?: string
  serviceofferingname?: string
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-slate-800 last:border-0">
      <span className="text-sm text-slate-400 w-44 shrink-0">{label}</span>
      <span className="text-sm text-white text-right flex-1">{value ?? '—'}</span>
    </div>
  )
}

function CodeBlock({ code }: { code: string }) {
  const copy = () => { navigator.clipboard.writeText(code); toast.success('Copied to clipboard') }
  return (
    <div className="relative group">
      <pre className="bg-slate-950 border border-slate-700 rounded-lg p-4 text-xs text-green-400 font-mono overflow-x-auto whitespace-pre-wrap break-all">
        {code}
      </pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 p-1.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Copy className="w-3 h-3" />
      </button>
    </div>
  )
}

export default function KubernetesDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = (params?.id ?? '') as string
  const [activeTab, setActiveTab] = useState('overview')

  const { data, error, isLoading, mutate } =
    useSWR<{ cluster: KubernetesCluster }>(`/api/compute/kubernetes/${id}`, fetcher)

  const cluster = data?.cluster

  const handleDownloadConfig = async () => {
    try {
      const res = await fetch(`/api/compute/kubernetes/${id}/config`)
      if (!res.ok) throw new Error('Failed to download kubeconfig')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${cluster?.name ?? id}-kubeconfig.yaml`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Kubeconfig downloaded')
    } catch (err: any) {
      toast.error(err.message || 'Failed to download kubeconfig')
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-slate-400">Failed to load cluster details</p>
        <button onClick={() => mutate()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    )
  }

  const kubeconfigPath = `~/.kube/${cluster?.name ?? 'config'}`
  const curlCommand = cluster?.endpoint
    ? `# Download kubeconfig and use it\ncurl -s /api/compute/kubernetes/${id}/config -o ${kubeconfigPath}\nexport KUBECONFIG=${kubeconfigPath}\nkubectl get nodes`
    : `# No endpoint available yet. The cluster may still be provisioning.`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Clusters
        </button>
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="animate-pulse bg-white/10 h-8 w-48 rounded" />
          ) : (
            <>
              <Container className="w-6 h-6 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">{cluster?.name ?? id}</h1>
              {cluster?.state && <StatusBadge status={cluster.state.toLowerCase()} />}
            </>
          )}
        </div>
      </div>

      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex gap-1 bg-slate-900/50 border border-slate-800 rounded-xl p-1">
          {['overview', 'access'].map(tab => (
            <Tabs.Trigger
              key={tab}
              value={tab}
              className={cn(
                'flex-1 px-6 py-2 rounded-lg text-sm font-medium capitalize transition-all',
                activeTab === tab ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              )}
            >
              {tab}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* Overview */}
        <Tabs.Content value="overview" className="mt-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => <div key={i} className="animate-pulse bg-white/10 h-8 rounded" />)}
              </div>
            ) : cluster ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                <div>
                  <InfoRow label="Name" value={cluster.name} />
                  <InfoRow label="State" value={<StatusBadge status={cluster.state?.toLowerCase()} />} />
                  <InfoRow label="Kubernetes Version" value={cluster.kubernetesversion} />
                  <InfoRow label="Worker Nodes" value={cluster.workernodes ?? cluster.size} />
                  <InfoRow label="Master Nodes" value={cluster.masternodes ?? 1} />
                </div>
                <div>
                  <InfoRow label="Zone" value={cluster.zonename} />
                  <InfoRow label="Endpoint" value={<span className="font-mono text-xs">{cluster.endpoint}</span>} />
                  <InfoRow label="IP Address" value={cluster.ipaddress} />
                  <InfoRow label="Network" value={cluster.networkname} />
                  <InfoRow label="CIDR" value={<span className="font-mono text-xs">{cluster.cidr}</span>} />
                  <InfoRow label="Service Offering" value={cluster.serviceofferingname} />
                  <InfoRow label="Account" value={cluster.account} />
                  <InfoRow label="Created" value={cluster.created ? new Date(cluster.created).toLocaleString() : undefined} />
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">No data available</p>
            )}
          </div>
        </Tabs.Content>

        {/* Access */}
        <Tabs.Content value="access" className="mt-4 space-y-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
              <Download className="w-4 h-4 text-blue-400" /> Download Kubeconfig
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Download the kubeconfig file to connect to this cluster using <code className="bg-slate-800 px-1 rounded text-blue-300">kubectl</code>.
            </p>
            <button
              onClick={handleDownloadConfig}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" /> Download kubeconfig
            </button>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
              <Terminal className="w-4 h-4 text-green-400" /> Using the kubeconfig
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Run these commands to start using kubectl with this cluster:
            </p>
            <CodeBlock code={curlCommand} />
            {cluster?.endpoint && (
              <div className="mt-4">
                <p className="text-slate-400 text-sm mb-2">API Server endpoint:</p>
                <CodeBlock code={`https://${cluster.endpoint}`} />
              </div>
            )}
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </motion.div>
  )
}
