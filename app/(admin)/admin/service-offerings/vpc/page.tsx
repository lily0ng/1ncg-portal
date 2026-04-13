'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import { Trash2, AlertTriangle, RefreshCw, ToggleLeft, ToggleRight, Shield } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { toast } from 'sonner'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

interface VPCOffering {
  id: string
  name: string
  displaytext?: string
  state?: string
  isdistributed?: boolean
  isredundant?: boolean
  supportedservices?: string | { name: string }[]
  created?: string
}

export default function VPCOfferingsPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/service-offerings/vpc', fetcher)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const offerings: VPCOffering[] = data?.vpcofferings || data?.offerings || []

  async function handleToggleState(o: VPCOffering) {
    const newState = o.state?.toLowerCase() === 'enabled' ? 'Disabled' : 'Enabled'
    setActionLoading(o.id)
    try {
      const res = await fetch(`/api/service-offerings/vpc/${o.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: newState }),
      })
      if (!res.ok) throw new Error('Failed to update')
      toast.success(`VPC offering ${newState.toLowerCase()}`)
      mutate()
    } catch (e: any) {
      toast.error(e.message || 'Error updating offering')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true)
    try {
      const res = await fetch(`/api/service-offerings/vpc/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('VPC offering deleted')
      setDeleteId(null)
      mutate()
    } catch (e: any) {
      toast.error(e.message || 'Error deleting offering')
    } finally {
      setDeleting(false)
    }
  }

  function formatServices(services: string | { name: string }[] | undefined): string {
    if (!services) return '-'
    if (typeof services === 'string') return services
    return services.map((s) => s.name).join(', ')
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <PageHeader
          title="VPC Offerings"
          description="Virtual Private Cloud service offerings"
          action={
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60">
              <Shield className="w-4 h-4" />
              <span>{offerings.length} Offerings</span>
            </div>
          }
        />
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">Failed to load VPC offerings.</p>
          <button onClick={() => mutate()} className="ml-auto flex items-center gap-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 px-3 py-1.5 rounded-lg transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-white/5 rounded" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]">
              <thead>
                <tr className="border-b border-white/10 text-white/60 text-xs uppercase tracking-wider">
                  {['Name', 'State', 'Distributed', 'Redundant', 'Supported Services', 'Created', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {offerings.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-white/40">No VPC offerings found</td></tr>
                ) : offerings.map((o) => (
                  <tr key={o.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-white">{o.name}</p>
                        {o.displaytext && o.displaytext !== o.name && (
                          <p className="text-xs text-white/40">{o.displaytext}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.state?.toLowerCase() || 'unknown'} />
                    </td>
                    <td className="px-4 py-3 text-white/80">{o.isdistributed ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 text-white/80">{o.isredundant ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 text-white/60 text-xs max-w-[200px] truncate">
                      {formatServices(o.supportedservices)}
                    </td>
                    <td className="px-4 py-3 text-white/50 text-xs">
                      {o.created ? new Date(o.created).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleState(o)}
                          disabled={actionLoading === o.id}
                          className={`p-1.5 rounded-lg transition-colors ${o.state?.toLowerCase() === 'enabled' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                          title={o.state?.toLowerCase() === 'enabled' ? 'Disable' : 'Enable'}
                        >
                          {o.state?.toLowerCase() === 'enabled'
                            ? <ToggleRight className="w-4 h-4" />
                            : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setDeleteId(o.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Delete VPC Offering</h2>
                <p className="text-sm text-white/50">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} disabled={deleting} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {deleting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
