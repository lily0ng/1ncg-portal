'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import { Server, Cpu, MemoryStick, HardDrive, Globe, AlertTriangle, RefreshCw } from 'lucide-react'
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts'
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

function gaugeColor(pct: number) {
  if (pct >= 90) return '#ef4444'
  if (pct >= 70) return '#eab308'
  return '#22c55e'
}

function GaugeCard({ label, used, total, unit }: { label: string; used: number; total: number; unit: string }) {
  const pct = total > 0 ? Math.min(Math.round((used / total) * 100), 100) : 0
  const color = gaugeColor(pct)
  const data = [{ value: pct, fill: color }]

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col items-center gap-2">
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <div className="relative w-36 h-36">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="70%" outerRadius="100%"
            startAngle={90} endAngle={-270}
            data={data}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar dataKey="value" cornerRadius={6} background={{ fill: '#ffffff10' }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{pct}%</span>
        </div>
      </div>
      <p className="text-xs text-slate-500">
        {used.toLocaleString()} / {total.toLocaleString()} {unit}
      </p>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse">
      <div className="h-4 bg-white/10 rounded w-2/3 mx-auto mb-4" />
      <div className="w-36 h-36 bg-white/10 rounded-full mx-auto" />
      <div className="h-3 bg-white/10 rounded w-1/2 mx-auto mt-4" />
    </div>
  )
}

function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 bg-white/5 rounded" />
      ))}
    </div>
  )
}

export default function InfrastructureSummaryPage() {
  const { data: capacity, error: capErr, isLoading: capLoading, mutate: mutateCapacity } =
    useSWR('/api/infrastructure/capacity', fetcher)
  const { data: hostsData, error: hostsErr, isLoading: hostsLoading } =
    useSWR('/api/infrastructure/hosts', fetcher)
  const { data: zonesData, error: zonesErr, isLoading: zonesLoading } =
    useSWR('/api/infrastructure/zones', fetcher)
  const { data: sysVmsData, error: sysVmsErr, isLoading: sysVmsLoading } =
    useSWR('/api/infrastructure/system-vms', fetcher)

  const hosts = hostsData?.hosts || []
  const zones = zonesData?.zones || []
  const sysVms = sysVmsData?.systemvms || []
  const caps = capacity?.capacity || []

  const cpuCap = caps.find((c: any) => c.type === 1) || caps.find((c: any) => c.name?.toLowerCase().includes('cpu'))
  const ramCap = caps.find((c: any) => c.type === 0) || caps.find((c: any) => c.name?.toLowerCase().includes('memory'))
  const storageCap = caps.find((c: any) => c.type === 2) || caps.find((c: any) => c.name?.toLowerCase().includes('storage'))
  const ipCap = caps.find((c: any) => c.type === 4) || caps.find((c: any) => c.name?.toLowerCase().includes('ip'))

  const hostsOnline = hosts.filter((h: any) => h.state === 'Up').length
  const hostsOffline = hosts.length - hostsOnline

  const isLoading = capLoading || hostsLoading || zonesLoading || sysVmsLoading
  const hasError = capErr || hostsErr || zonesErr || sysVmsErr

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={itemVariants}>
        <PageHeader title="Infrastructure Summary" description="Overview of your CloudStack infrastructure resources" />
      </motion.div>

      {hasError && (
        <motion.div variants={itemVariants} className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">Failed to load some infrastructure data.</p>
          <button onClick={() => mutateCapacity()} className="ml-auto flex items-center gap-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 px-3 py-1.5 rounded-lg transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </motion.div>
      )}

      {/* Capacity Gauges */}
      <motion.div variants={itemVariants}>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Capacity</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {capLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : <>
              <GaugeCard label="CPU Allocated" used={cpuCap?.capacityused ?? 0} total={cpuCap?.capacitytotal ?? 100} unit="MHz" />
              <GaugeCard label="RAM Allocated" used={ramCap?.capacityused ?? 0} total={ramCap?.capacitytotal ?? 100} unit="MB" />
              <GaugeCard label="Primary Storage" used={storageCap?.capacityused ?? 0} total={storageCap?.capacitytotal ?? 100} unit="GB" />
              <GaugeCard label="Public IPs Used" used={ipCap?.capacityused ?? 0} total={ipCap?.capacitytotal ?? 100} unit="IPs" />
            </>
          }
        </div>
      </motion.div>

      {/* Zones Table */}
      <motion.div variants={itemVariants}>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Zones</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          {zonesLoading ? (
            <div className="p-4"><SkeletonTable /></div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">State</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-right">Hosts</th>
                  <th className="px-4 py-3 text-right">VMs</th>
                  <th className="px-4 py-3 text-right">Networks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {zones.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No zones found</td></tr>
                )}
                {zones.map((z: any) => (
                  <tr key={z.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{z.name}</td>
                    <td className="px-4 py-3"><StatusBadge status={z.allocationstate || z.state || 'unknown'} /></td>
                    <td className="px-4 py-3 text-slate-300">{z.networktype || z.type || '-'}</td>
                    <td className="px-4 py-3 text-right text-slate-300">{z.hosts ?? '-'}</td>
                    <td className="px-4 py-3 text-right text-slate-300">{z.vms ?? '-'}</td>
                    <td className="px-4 py-3 text-right text-slate-300">{z.networks ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* Hosts Overview + System VMs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Hosts Overview</h2>
          {hostsLoading ? (
            <SkeletonCard />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total', value: hosts.length, color: 'text-blue-400 bg-blue-500/10' },
                  { label: 'Online', value: hostsOnline, color: 'text-green-400 bg-green-500/10' },
                  { label: 'Offline', value: hostsOffline, color: 'text-red-400 bg-red-500/10' },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`rounded-lg p-3 text-center ${color}`}>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-xs mt-1 opacity-80">{label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {hosts.slice(0, 10).map((h: any) => (
                  <div key={h.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded hover:bg-white/5">
                    <span className="text-slate-300 font-medium">{h.name}</span>
                    <StatusBadge status={h.state?.toLowerCase() || 'unknown'} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">System VMs</h2>
          {sysVmsLoading ? (
            <SkeletonTable rows={6} />
          ) : (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {sysVms.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">No system VMs found</p>
              )}
              {sysVms.map((vm: any) => (
                <div key={vm.id} className="flex items-center justify-between text-xs py-2 px-2 rounded hover:bg-white/5">
                  <div>
                    <p className="text-slate-200 font-medium">{vm.name}</p>
                    <p className="text-slate-500">{vm.systemvmtype}</p>
                  </div>
                  <StatusBadge status={vm.state?.toLowerCase() || 'unknown'} />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
