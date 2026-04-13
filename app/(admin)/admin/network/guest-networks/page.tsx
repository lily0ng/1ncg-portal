'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { Plus, Trash2, X, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Network {
  id: string
  name: string
  displaytext?: string
  state?: string
  type?: string
  cidr?: string
  gateway?: string
  zonename?: string
  vpcname?: string
  account?: string
  created?: string
  networkofferingname?: string
}

interface Zone {
  id: string
  name: string
}

interface NetworkOffering {
  id: string
  name: string
}

interface VPC {
  id: string
  name: string
}

export default function GuestNetworksPage() {
  const router = useRouter()
  const { data, error, isLoading, mutate } = useSWR('/api/network/networks', fetcher, { refreshInterval: 30000 })
  const { data: zonesData } = useSWR('/api/zones', fetcher)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Network | null>(null)
  const [zoneFilter, setZoneFilter] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '', displaytext: '', zoneid: '', networkofferingid: '', gateway: '', netmask: '', vpcid: '',
  })

  const { data: offeringsData } = useSWR(showCreate ? '/api/service-offerings/network' : null, fetcher)
  const { data: vpcData } = useSWR(showCreate ? '/api/network/vpc' : null, fetcher)

  const networks: Network[] = data?.networks || []
  const zones: Zone[] = zonesData?.zones || []
  const offerings: NetworkOffering[] = offeringsData?.networkofferings || []
  const vpcs: VPC[] = vpcData?.vpcs || []

  const filtered = networks.filter(n => {
    const matchZone = !zoneFilter || n.zonename === zoneFilter
    const matchState = !stateFilter || n.state?.toLowerCase() === stateFilter.toLowerCase()
    const matchType = !typeFilter || n.type?.toLowerCase() === typeFilter.toLowerCase()
    return matchZone && matchState && matchType
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/network/networks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Network created')
      setShowCreate(false)
      setForm({ name: '', displaytext: '', zoneid: '', networkofferingid: '', gateway: '', netmask: '', vpcid: '' })
      mutate()
    } catch {
      toast.error('Failed to create network')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRestart = async (network: Network) => {
    try {
      await fetch(`/api/network/networks?id=${network.id}&action=restart`, { method: 'POST' })
      toast.success('Network restart initiated')
      mutate()
    } catch {
      toast.error('Failed to restart network')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await fetch(`/api/network/networks?id=${deleteTarget.id}`, { method: 'DELETE' })
      toast.success('Network deleted')
      setDeleteTarget(null)
      mutate()
    } catch {
      toast.error('Failed to delete network')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Guest Networks"
        description="Manage guest networks — auto-refreshes every 30s"
        action={
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Create Network
          </button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <select value={zoneFilter} onChange={e => setZoneFilter(e.target.value)} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500">
          <option value="">All Zones</option>
          {zones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
        </select>
        <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500">
          <option value="">All States</option>
          <option value="implemented">Implemented</option>
          <option value="shutdown">Shutdown</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500">
          <option value="">All Types</option>
          <option value="isolated">Isolated</option>
          <option value="shared">Shared</option>
          <option value="l2">L2</option>
        </select>
      </div>

      {isLoading && (
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-white/5 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-32" />
              <div className="h-5 bg-white/10 rounded-full w-20" />
              <div className="h-4 bg-white/10 rounded w-24" />
              <div className="h-4 bg-white/10 rounded w-32" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-center">
          <p className="text-red-400 mb-3">Failed to load networks</p>
          <button onClick={() => mutate()} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">Retry</button>
        </div>
      )}

      {!isLoading && !error && (
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-white/60 text-sm font-medium">Name</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">State</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Type</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">CIDR</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Gateway</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Zone</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">VPC</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Account</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Created</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="p-8 text-center text-white/40">No networks found</td></tr>
              ) : filtered.map(net => (
                <tr key={net.id} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => router.push(`/admin/network/guest-networks/${net.id}`)}>
                  <td className="p-4">
                    <p className="text-white font-medium">{net.name}</p>
                    <p className="text-xs text-white/40">{net.displaytext}</p>
                  </td>
                  <td className="p-4"><StatusBadge status={net.state || 'unknown'} /></td>
                  <td className="p-4"><span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 capitalize">{net.type || '-'}</span></td>
                  <td className="p-4 text-white/60 text-sm font-mono">{net.cidr || '-'}</td>
                  <td className="p-4 text-white/60 text-sm">{net.gateway || '-'}</td>
                  <td className="p-4 text-white/60 text-sm">{net.zonename || '-'}</td>
                  <td className="p-4 text-white/60 text-sm">{net.vpcname || '-'}</td>
                  <td className="p-4 text-white/60 text-sm">{net.account || '-'}</td>
                  <td className="p-4 text-white/40 text-sm">{net.created ? new Date(net.created).toLocaleDateString() : '-'}</td>
                  <td className="p-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleRestart(net)} className="p-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors" title="Restart">
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(net)} className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Create Guest Network</h2>
              <button onClick={() => setShowCreate(false)} className="text-white/40 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1">Name *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500" placeholder="my-network" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Display Text</label>
                <input value={form.displaytext} onChange={e => setForm(f => ({ ...f, displaytext: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500" placeholder="My Network" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Zone *</label>
                <select required value={form.zoneid} onChange={e => setForm(f => ({ ...f, zoneid: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500">
                  <option value="">Select Zone</option>
                  {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Network Offering</label>
                <select value={form.networkofferingid} onChange={e => setForm(f => ({ ...f, networkofferingid: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500">
                  <option value="">Select Offering</option>
                  {offerings.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Gateway</label>
                  <input value={form.gateway} onChange={e => setForm(f => ({ ...f, gateway: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500" placeholder="10.0.0.1" />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Netmask</label>
                  <input value={form.netmask} onChange={e => setForm(f => ({ ...f, netmask: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500" placeholder="255.255.255.0" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">VPC (optional)</label>
                <select value={form.vpcid} onChange={e => setForm(f => ({ ...f, vpcid: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500">
                  <option value="">No VPC</option>
                  {vpcs.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-colors">{submitting ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-white mb-2">Delete Network</h2>
            <p className="text-white/60 mb-6">Delete <span className="text-white font-medium">{deleteTarget.name}</span>?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors">Cancel</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
