'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, AlertTriangle, RefreshCw, Server, HardDrive, Network } from 'lucide-react'
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

const TABS = ['Overview', 'Resources'] as const
type Tab = typeof TABS[number]

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-3 border-b border-white/5 last:border-0">
      <span className="text-slate-400 text-sm w-48 flex-shrink-0">{label}</span>
      <span className="text-white text-sm font-medium break-all">{value ?? '-'}</span>
    </div>
  )
}

export default function ZoneDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = (params?.id ?? '') as string
  const [activeTab, setActiveTab] = useState<Tab>('Overview')

  const { data: zonesData, error, isLoading, mutate } = useSWR('/api/infrastructure/zones', fetcher)
  const { data: hostsData } = useSWR('/api/infrastructure/hosts', fetcher)
  const { data: clustersData } = useSWR('/api/infrastructure/clusters', fetcher)
  const { data: storageData } = useSWR('/api/infrastructure/storage-pools', fetcher)
  const { data: vmsData } = useSWR('/api/compute/vms', fetcher)

  const zones = zonesData?.zones || []
  const zone = zones.find((z: any) => z.id === id)
  const hosts = (hostsData?.hosts || []).filter((h: any) => h.zoneid === id)
  const clusters = (clustersData?.clusters || []).filter((c: any) => c.zoneid === id)
  const storagePools = (storageData?.storagepools || []).filter((s: any) => s.zoneid === id)
  const vms = (vmsData?.vms || []).filter((v: any) => v.zoneid === id)

  if (error) {
    return (
      <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
        <AlertTriangle className="w-5 h-5" />
        <p className="text-sm">Failed to load zone details.</p>
        <button onClick={() => mutate()} className="ml-auto flex items-center gap-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 px-3 py-1.5 rounded-lg transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          {isLoading ? (
            <div className="h-7 w-48 bg-white/10 rounded animate-pulse" />
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white">{zone?.name || 'Zone'}</h1>
              <p className="text-slate-400 text-sm mt-0.5">{zone?.id}</p>
            </>
          )}
        </div>
        {zone && <StatusBadge status={zone.allocationstate?.toLowerCase() || 'unknown'} className="ml-2" />}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-1 bg-white/5 border border-white/10 p-1 rounded-xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      {activeTab === 'Overview' && (
        <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-xl p-6">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 bg-white/5 rounded" />
              ))}
            </div>
          ) : !zone ? (
            <p className="text-slate-400 text-sm">Zone not found</p>
          ) : (
            <div>
              <FieldRow label="Name" value={zone.name} />
              <FieldRow label="ID" value={<span className="font-mono text-xs">{zone.id}</span>} />
              <FieldRow label="Network Type" value={zone.networktype} />
              <FieldRow label="Allocation State" value={<StatusBadge status={zone.allocationstate?.toLowerCase() || 'unknown'} />} />
              <FieldRow label="DNS 1" value={<span className="font-mono text-xs">{zone.dns1}</span>} />
              <FieldRow label="DNS 2" value={<span className="font-mono text-xs">{zone.dns2}</span>} />
              <FieldRow label="Internal DNS 1" value={<span className="font-mono text-xs">{zone.internaldns1}</span>} />
              <FieldRow label="Internal DNS 2" value={<span className="font-mono text-xs">{zone.internaldns2}</span>} />
              <FieldRow label="Guest CIDR" value={<span className="font-mono text-xs">{zone.guestcidraddress}</span>} />
              <FieldRow label="Description" value={zone.description} />
              <FieldRow label="Local Storage" value={zone.localstorageenabled ? 'Enabled' : 'Disabled'} />
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'Resources' && (
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Server, label: 'Hosts', value: hosts.length, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
              { icon: Server, label: 'Virtual Machines', value: vms.length, color: 'text-green-400 bg-green-500/10 border-green-500/20' },
              { icon: HardDrive, label: 'Storage Pools', value: storagePools.length, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className={`border rounded-xl p-5 flex items-center gap-4 ${color}`}>
                <div className="p-2.5 rounded-lg bg-white/5">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-sm mt-0.5 opacity-80">{label}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Clusters ({clusters.length})</h3>
              {clusters.length === 0 ? (
                <p className="text-slate-500 text-sm">No clusters in this zone</p>
              ) : (
                <div className="space-y-1">
                  {clusters.map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between text-sm py-1.5 px-2 rounded hover:bg-white/5">
                      <span className="text-slate-200">{c.name}</span>
                      <StatusBadge status={c.allocationstate?.toLowerCase() || 'unknown'} />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Storage Pools ({storagePools.length})</h3>
              {storagePools.length === 0 ? (
                <p className="text-slate-500 text-sm">No storage pools in this zone</p>
              ) : (
                <div className="space-y-1">
                  {storagePools.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between text-sm py-1.5 px-2 rounded hover:bg-white/5">
                      <span className="text-slate-200">{s.name}</span>
                      <StatusBadge status={s.state?.toLowerCase() || 'unknown'} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
