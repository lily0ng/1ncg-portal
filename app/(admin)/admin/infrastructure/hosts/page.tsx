'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { Server, Wrench, RefreshCw as ReconnectIcon, ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

function UsageBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-green-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-white/10 rounded-full h-1.5 w-20">
        <div className={cn('h-1.5 rounded-full transition-all', color)} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
    </div>
  )
}

export default function HostsPage() {
  const router = useRouter()
  const { data, error, isLoading, mutate } = useSWR('/api/infrastructure/hosts', fetcher, { refreshInterval: 30000 })
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const hosts = data?.hosts || []
  const hostsOnline = hosts.filter((h: any) => h.state === 'Up').length
  const hostsOffline = hosts.length - hostsOnline

  async function handleAction(action: string, host: any) {
    setActionLoading(host.id + '-' + action)
    try {
      const res = await fetch(`/api/infrastructure/hosts/${host.id}/${action}`, { method: 'POST' })
      if (!res.ok) throw new Error()
      toast.success(`Host ${action} successful`)
      mutate()
    } catch {
      toast.error(`Failed to ${action} host`)
    } finally {
      setActionLoading(null)
    }
  }

  function rowBg(host: any) {
    const cpuPct = host.cpuused ? parseFloat(host.cpuused) : 0
    const ramPct = host.memoryused && host.memorytotal
      ? Math.round((host.memoryused / host.memorytotal) * 100) : 0
    if (cpuPct >= 90 || ramPct >= 90) return 'border-l-2 border-l-red-500'
    if (cpuPct >= 70 || ramPct >= 70) return 'border-l-2 border-l-yellow-500'
    return ''
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <PageHeader title="Hosts" description="Physical host management — auto-refreshes every 30s" />
      </motion.div>

      {/* Summary Bar */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Hosts', value: hosts.length, color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
          { label: 'Online', value: hostsOnline, color: 'bg-green-500/10 border-green-500/20 text-green-400' },
          { label: 'Offline', value: hostsOffline, color: 'bg-red-500/10 border-red-500/20 text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`border rounded-xl p-4 flex items-center gap-4 ${color}`}>
            <Server className="w-8 h-8 opacity-60" />
            <div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-sm opacity-80">{label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
          <AlertTriangle className="w-5 h-5" />
          <p className="text-sm">Failed to load hosts.</p>
          <button onClick={() => mutate()} className="ml-auto flex items-center gap-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 px-3 py-1.5 rounded-lg transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 bg-white/5 rounded" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1100px]">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">State</th>
                  <th className="px-4 py-3 text-left">Zone</th>
                  <th className="px-4 py-3 text-left">Cluster</th>
                  <th className="px-4 py-3 text-left">CPU Used</th>
                  <th className="px-4 py-3 text-left">RAM Used</th>
                  <th className="px-4 py-3 text-right">VMs</th>
                  <th className="px-4 py-3 text-left">Hypervisor</th>
                  <th className="px-4 py-3 text-left">Version</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {hosts.length === 0 && (
                  <tr><td colSpan={10} className="px-4 py-10 text-center text-slate-500">No hosts found</td></tr>
                )}
                {hosts.map((host: any) => {
                  const cpuPct = host.cpuused ? parseFloat(host.cpuused) : 0
                  const ramPct = host.memoryused && host.memorytotal
                    ? Math.round((host.memoryused / host.memorytotal) * 100) : 0
                  return (
                    <tr
                      key={host.id}
                      className={cn('hover:bg-white/5 transition-colors cursor-pointer', rowBg(host))}
                      onClick={() => router.push(`/admin/infrastructure/hosts/${host.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-white">{host.name}</p>
                          <p className="text-xs text-slate-500">{host.ipaddress}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={host.state?.toLowerCase() || 'unknown'} /></td>
                      <td className="px-4 py-3 text-slate-300">{host.zonename || '-'}</td>
                      <td className="px-4 py-3 text-slate-300">{host.clustername || '-'}</td>
                      <td className="px-4 py-3"><UsageBar pct={Math.round(cpuPct)} /></td>
                      <td className="px-4 py-3"><UsageBar pct={ramPct} /></td>
                      <td className="px-4 py-3 text-right text-slate-300">{host.vmcount ?? '-'}</td>
                      <td className="px-4 py-3">
                        {host.hypervisor && (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">{host.hypervisor}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs font-mono">{host.version || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => handleAction('maintenance', host)}
                            disabled={!!actionLoading}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-yellow-500/20 text-slate-400 hover:text-yellow-400 transition-colors"
                            title="Enable Maintenance"
                          >
                            <Wrench className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAction('reconnect', host)}
                            disabled={!!actionLoading}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 transition-colors"
                            title="Reconnect"
                          >
                            <ReconnectIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAction('forceha', host)}
                            disabled={!!actionLoading}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-green-500/20 text-slate-400 hover:text-green-400 transition-colors"
                            title="Force HA"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
