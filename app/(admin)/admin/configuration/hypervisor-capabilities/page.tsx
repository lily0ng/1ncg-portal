'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Check, X, Cpu } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

interface HypervisorCapability {
  id: string
  hypervisor: string
  hypervisorversion?: string
  maxguestslimit?: number
  maxdatavolumeslimit?: number
  maxhostspercluster?: number
  isstoragemotionsupported?: boolean
  islivemigrationenabled?: boolean
}

export default function HypervisorCapabilitiesPage() {
  const [capabilities, setCapabilities] = useState<HypervisorCapability[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchCapabilities() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/configuration/hypervisors')
      if (!res.ok) throw new Error('Failed to fetch hypervisor capabilities')
      const data = await res.json()
      setCapabilities(data?.hypervisorcapabilities || data?.capabilities || [])
    } catch (e: any) {
      setError(e.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCapabilities() }, [])

  const hypervisorColors: Record<string, string> = {
    xenserver: 'bg-blue-500/20 text-blue-400',
    vmware: 'bg-purple-500/20 text-purple-400',
    kvm: 'bg-green-500/20 text-green-400',
    hyperv: 'bg-sky-500/20 text-sky-400',
    lxc: 'bg-orange-500/20 text-orange-400',
    ovm3: 'bg-yellow-500/20 text-yellow-400',
  }

  function getHypervisorColor(hv: string): string {
    return hypervisorColors[hv?.toLowerCase()] || 'bg-white/10 text-white/60'
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Hypervisor Capabilities"
          description="Supported features and limits per hypervisor version"
          action={
            <button onClick={fetchCapabilities} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg font-medium transition-colors text-sm">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          }
        />
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <button onClick={fetchCapabilities} className="ml-auto flex items-center gap-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 px-3 py-1.5 rounded-lg transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 bg-white/5 rounded" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]">
              <thead>
                <tr className="border-b border-white/10 text-white/60 text-xs uppercase tracking-wider">
                  {['Hypervisor', 'Version', 'Max Guests', 'Max Data Volumes', 'Max Hosts/Cluster', 'Storage Migration', 'Live Migration'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {capabilities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center">
                      <div className="flex flex-col items-center gap-3 text-white/40">
                        <Cpu className="w-10 h-10 opacity-40" />
                        <p>No hypervisor capabilities found</p>
                      </div>
                    </td>
                  </tr>
                ) : capabilities.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getHypervisorColor(c.hypervisor)}`}>
                        {c.hypervisor}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-white/80">{c.hypervisorversion || 'All'}</td>
                    <td className="px-4 py-3 text-white/80">{c.maxguestslimit ?? '-'}</td>
                    <td className="px-4 py-3 text-white/80">{c.maxdatavolumeslimit ?? '-'}</td>
                    <td className="px-4 py-3 text-white/80">{c.maxhostspercluster ?? '-'}</td>
                    <td className="px-4 py-3">
                      {c.isstoragemotionsupported
                        ? <span className="flex items-center gap-1.5 text-green-400 text-xs"><Check className="w-3.5 h-3.5" /> Supported</span>
                        : <span className="flex items-center gap-1.5 text-white/30 text-xs"><X className="w-3.5 h-3.5" /> Not Supported</span>}
                    </td>
                    <td className="px-4 py-3">
                      {c.islivemigrationenabled
                        ? <span className="flex items-center gap-1.5 text-green-400 text-xs"><Check className="w-3.5 h-3.5" /> Enabled</span>
                        : <span className="flex items-center gap-1.5 text-white/30 text-xs"><X className="w-3.5 h-3.5" /> Disabled</span>}
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
