'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trash2, AlertTriangle, RefreshCw, ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { toast } from 'sonner'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

interface BackupOffering {
  id: string
  name: string
  externalid?: string
  description?: string
  zoneid?: string
  zonename?: string
  created?: string
}

export default function BackupOfferingsPage() {
  const [offerings, setOfferings] = useState<BackupOffering[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function fetchOfferings() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/service-offerings/backup')
      if (!res.ok) throw new Error('Failed to fetch backup offerings')
      const data = await res.json()
      setOfferings(data?.backupofferings || data?.offerings || [])
    } catch (e: any) {
      setError(e.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOfferings() }, [])

  async function handleDelete(id: string) {
    setDeleting(true)
    try {
      const res = await fetch(`/api/service-offerings/backup/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Backup offering deleted')
      setDeleteId(null)
      fetchOfferings()
    } catch (e: any) {
      toast.error(e.message || 'Error deleting offering')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Backup Offerings"
          description="CloudStack backup service offerings for VM protection"
          action={
            <button onClick={fetchOfferings} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg font-medium transition-colors text-sm">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          }
        />
      </motion.div>

      <motion.div variants={itemVariants} className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-300">
          Backup offerings are retrieved from CloudStack's backup provider. These offerings define backup policies and retention settings available in each zone.
        </p>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <button onClick={fetchOfferings} className="ml-auto flex items-center gap-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 px-3 py-1.5 rounded-lg transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-white/5 rounded" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-white/10 text-white/60 text-xs uppercase tracking-wider">
                  {['Name', 'External ID', 'Description', 'Zone', 'Created', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {offerings.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-white/40">No backup offerings found</td></tr>
                ) : offerings.map((o) => (
                  <tr key={o.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{o.name}</td>
                    <td className="px-4 py-3 text-white/60 font-mono text-xs">{o.externalid || '-'}</td>
                    <td className="px-4 py-3 text-white/60 text-xs max-w-[200px] truncate">{o.description || '-'}</td>
                    <td className="px-4 py-3 text-white/80">{o.zonename || o.zoneid || 'All Zones'}</td>
                    <td className="px-4 py-3 text-white/50 text-xs">
                      {o.created ? new Date(o.created).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDeleteId(o.id)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
                <h2 className="text-base font-semibold text-white">Delete Backup Offering</h2>
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
