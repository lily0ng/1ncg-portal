'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Server } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

interface SystemOffering {
  id: string
  name: string
  displaytext?: string
  cpunumber?: number
  cpuspeed?: number
  memory?: number
  systemvmtype?: string
  created?: string
  issystem?: boolean
}

export default function SystemOfferingsPage() {
  const [offerings, setOfferings] = useState<SystemOffering[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchOfferings() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/service-offerings/compute?issystem=true')
      if (!res.ok) throw new Error('Failed to fetch system offerings')
      const data = await res.json()
      const all: SystemOffering[] = data?.serviceofferings || data?.offerings || []
      setOfferings(all.filter((o) => o.issystem === true || o.systemvmtype))
    } catch (e: any) {
      setError(e.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOfferings()
  }, [])

  const systemVmTypeLabel: Record<string, string> = {
    domainrouter: 'Domain Router',
    consoleproxy: 'Console Proxy',
    secondarystoragevm: 'Secondary Storage VM',
    elb: 'ELB',
    lbvm: 'Load Balancer VM',
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <PageHeader
          title="System Offerings"
          description="Service offerings reserved for CloudStack system VMs"
          action={
            <button onClick={fetchOfferings} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg font-medium transition-colors text-sm">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          }
        />
      </motion.div>

      <motion.div variants={itemVariants} className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
        <Server className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-300">
          System VM offerings are used by CloudStack internal virtual machines such as Console Proxy, Secondary Storage VM, and Virtual Routers. These cannot be assigned to user instances.
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
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-white/5 rounded" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-white/10 text-white/60 text-xs uppercase tracking-wider">
                  {['Name', 'System VM Type', 'vCPUs', 'RAM (MB)', 'CPU Speed (MHz)', 'Created'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {offerings.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-white/40">No system offerings found</td></tr>
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
                      {o.systemvmtype ? (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs font-medium">
                          {systemVmTypeLabel[o.systemvmtype.toLowerCase()] || o.systemvmtype}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-white/80">{o.cpunumber ?? '-'}</td>
                    <td className="px-4 py-3 text-white/80">{o.memory ?? '-'}</td>
                    <td className="px-4 py-3 text-white/80">{o.cpuspeed ? `${o.cpuspeed}` : '-'}</td>
                    <td className="px-4 py-3 text-white/50 text-xs">
                      {o.created ? new Date(o.created).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
