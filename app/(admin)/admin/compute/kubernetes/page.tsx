'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Plus, Download, Trash2, AlertCircle, RefreshCw, Container } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'

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
  endpoint?: string
  created?: string
  account?: string
}

interface Zone { id: string; name: string }
interface K8sVersion { id: string; name: string; semanticversion?: string }
interface ServiceOffering { id: string; name: string }
interface Network { id: string; name: string }

export default function KubernetesPage() {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '', zoneid: '', kubernetesversionid: '', serviceofferingid: '',
    networkid: '', size: 1,
  })

  const { data, error, isLoading, mutate } =
    useSWR<{ clusters: KubernetesCluster[] }>('/api/compute/kubernetes', fetcher, { refreshInterval: 30000 })

  const { data: zones } = useSWR<{ zones: Zone[] }>(modalOpen ? '/api/zones' : null, fetcher)
  const { data: k8sVersions } = useSWR<{ versions: K8sVersion[] }>(modalOpen ? '/api/compute/kubernetes/versions' : null, fetcher)
  const { data: offerings } = useSWR<{ serviceofferings: ServiceOffering[] }>(modalOpen ? '/api/service-offerings/compute' : null, fetcher)
  const { data: networks } = useSWR<{ networks: Network[] }>(modalOpen ? '/api/network/networks' : null, fetcher)

  const handleDownloadConfig = async (cluster: KubernetesCluster) => {
    try {
      const res = await fetch(`/api/compute/kubernetes/${cluster.id}/config`)
      if (!res.ok) throw new Error('Failed to download kubeconfig')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${cluster.name}-kubeconfig.yaml`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Kubeconfig downloaded')
    } catch (err: any) {
      toast.error(err.message || 'Failed to download kubeconfig')
    }
  }

  const handleDelete = async (cluster: KubernetesCluster) => {
    if (!confirm(`Delete cluster "${cluster.name}"? All worker nodes will be destroyed.`)) return
    try {
      const res = await fetch(`/api/compute/kubernetes/${cluster.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      toast.success(`Cluster "${cluster.name}" deletion initiated`)
      mutate()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete cluster')
    }
  }

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error('Cluster name is required'); return }
    if (!form.zoneid) { toast.error('Zone is required'); return }
    if (!form.kubernetesversionid) { toast.error('Kubernetes version is required'); return }
    if (!form.serviceofferingid) { toast.error('Service offering is required'); return }
    if (!form.networkid) { toast.error('Network is required'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/compute/kubernetes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to create cluster')
      toast.success('Kubernetes cluster creation initiated')
      setModalOpen(false)
      setForm({ name: '', zoneid: '', kubernetesversionid: '', serviceofferingid: '', networkid: '', size: 1 })
      mutate()
    } catch (err: any) {
      toast.error(err.message || 'Failed to create cluster')
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      cell: (c: KubernetesCluster) => (
        <div className="flex items-center gap-2">
          <Container className="w-4 h-4 text-blue-400 shrink-0" />
          <div>
            <p className="font-medium text-white">{c.name}</p>
            <p className="text-xs text-slate-500 font-mono">{c.id}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'state',
      header: 'State',
      cell: (c: KubernetesCluster) => <StatusBadge status={(c.state ?? 'unknown').toLowerCase()} />,
      sortable: true,
    },
    {
      key: 'kubernetesversion',
      header: 'K8s Version',
      cell: (c: KubernetesCluster) => <span className="text-sm text-slate-300">{c.kubernetesversion ?? '—'}</span>,
    },
    {
      key: 'workernodes',
      header: 'Workers',
      cell: (c: KubernetesCluster) => <span className="text-sm text-slate-300">{c.workernodes ?? c.size ?? '—'}</span>,
    },
    {
      key: 'masternodes',
      header: 'Master Nodes',
      cell: (c: KubernetesCluster) => <span className="text-sm text-slate-300">{c.masternodes ?? 1}</span>,
    },
    {
      key: 'zonename',
      header: 'Zone',
      cell: (c: KubernetesCluster) => <span className="text-sm text-slate-300">{c.zonename ?? '—'}</span>,
    },
    {
      key: 'endpoint',
      header: 'Endpoint',
      cell: (c: KubernetesCluster) => (
        <span className="text-xs font-mono text-slate-300 truncate max-w-[160px] block">{c.endpoint ?? '—'}</span>
      ),
    },
    {
      key: 'created',
      header: 'Created',
      cell: (c: KubernetesCluster) => (
        <span className="text-sm text-slate-300">{c.created ? new Date(c.created).toLocaleDateString() : '—'}</span>
      ),
      sortable: true,
    },
  ]

  const rowActions = (c: KubernetesCluster) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleDownloadConfig(c)}
        className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-xs transition-colors"
      >
        <Download className="w-3 h-3" /> Kubeconfig
      </button>
      <button
        onClick={() => handleDelete(c)}
        className="flex items-center gap-1 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs transition-colors"
      >
        <Trash2 className="w-3 h-3" /> Delete
      </button>
    </div>
  )

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-slate-400">Failed to load Kubernetes clusters</p>
        <button onClick={() => mutate()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Kubernetes Clusters"
        description="Manage CloudStack Kubernetes Service clusters"
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Cluster
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={data?.clusters ?? []}
        loading={isLoading}
        rowActions={rowActions}
        onRowClick={c => router.push(`/admin/compute/kubernetes/${c.id}`)}
      />

      {/* Create Cluster Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg overflow-y-auto max-h-[90vh]"
          >
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Container className="w-5 h-5 text-blue-400" /> Create Kubernetes Cluster
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Cluster Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="my-k8s-cluster"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {[
                { label: 'Zone', key: 'zoneid', options: zones?.zones?.map((z: Zone) => ({ id: z.id, name: z.name })) ?? [] },
                { label: 'Kubernetes Version', key: 'kubernetesversionid', options: k8sVersions?.versions?.map((v: K8sVersion) => ({ id: v.id, name: v.semanticversion || v.name })) ?? [] },
                { label: 'Service Offering', key: 'serviceofferingid', options: offerings?.serviceofferings?.map((o: ServiceOffering) => ({ id: o.id, name: o.name })) ?? [] },
                { label: 'Network', key: 'networkid', options: networks?.networks?.map((n: Network) => ({ id: n.id, name: n.name })) ?? [] },
              ].map(({ label, key, options }) => (
                <div key={key}>
                  <label className="block text-sm text-slate-400 mb-1">{label}</label>
                  <select
                    value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">— Select {label} —</option>
                    {options.map((o: { id: string; name: string }) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
              ))}
              <div>
                <label className="block text-sm text-slate-400 mb-1">Worker Count</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={form.size}
                  onChange={e => setForm(f => ({ ...f, size: parseInt(e.target.value) || 1 }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {submitting ? 'Creating…' : 'Create Cluster'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
