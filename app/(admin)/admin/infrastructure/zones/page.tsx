'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { Plus, ToggleLeft, ToggleRight, Pencil, Trash2, AlertTriangle, RefreshCw } from 'lucide-react'
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

export default function ZonesPage() {
  const router = useRouter()
  const { data, error, isLoading, mutate } = useSWR('/api/infrastructure/zones', fetcher)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const zones = data?.zones || []

  async function handleToggle(zone: any) {
    const action = zone.allocationstate === 'Enabled' ? 'disable' : 'enable'
    setActionLoading(zone.id)
    try {
      const res = await fetch(`/api/infrastructure/zones/${zone.id}/${action}`, { method: 'POST' })
      if (!res.ok) throw new Error()
      toast.success(`Zone ${action}d successfully`)
      mutate()
    } catch {
      toast.error(`Failed to ${action} zone`)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete(zone: any) {
    if (!confirm(`Delete zone "${zone.name}"? This cannot be undone.`)) return
    setActionLoading(zone.id + '-del')
    try {
      const res = await fetch(`/api/infrastructure/zones/${zone.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Zone deleted')
      mutate()
    } catch {
      toast.error('Failed to delete zone')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Zones"
          description="Manage availability zones"
          action={
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors text-sm">
              <Plus className="w-4 h-4" />
              Add Zone
            </button>
          }
        />
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">Failed to load zones.</p>
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
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">DNS 1</th>
                <th className="px-4 py-3 text-left">DNS 2</th>
                <th className="px-4 py-3 text-left">Guest CIDR</th>
                <th className="px-4 py-3 text-left">Allocation</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {zones.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-500">No zones found</td></tr>
              )}
              {zones.map((zone: any) => (
                <tr
                  key={zone.id}
                  className="hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/infrastructure/zones/${zone.id}`)}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-white">{zone.name}</p>
                      <p className="text-xs text-slate-500">{zone.id}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{zone.networktype || '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={zone.allocationstate?.toLowerCase() || 'unknown'} /></td>
                  <td className="px-4 py-3 text-slate-300 font-mono text-xs">{zone.dns1 || '-'}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono text-xs">{zone.dns2 || '-'}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono text-xs">{zone.guestcidraddress || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      zone.allocationstate === 'Enabled'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {zone.allocationstate || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggle(zone)}
                        disabled={actionLoading === zone.id}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        title={zone.allocationstate === 'Enabled' ? 'Disable' : 'Enable'}
                      >
                        {zone.allocationstate === 'Enabled'
                          ? <ToggleRight className="w-4 h-4 text-green-400" />
                          : <ToggleLeft className="w-4 h-4" />
                        }
                      </button>
                      <button
                        onClick={() => router.push(`/admin/infrastructure/zones/${zone.id}?edit=1`)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(zone)}
                        disabled={actionLoading === zone.id + '-del'}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete"
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
