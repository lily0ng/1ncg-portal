'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import { Info, Clock, Calendar, RefreshCcw, Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Volume {
  id: string
  name: string
  state: string
  type: string
  size: number
  zonename: string
  account: string
}

const INTERVAL_ICONS: Record<string, React.ReactNode> = {
  HOURLY: <Clock className="w-4 h-4" />,
  DAILY: <Calendar className="w-4 h-4" />,
  WEEKLY: <RefreshCcw className="w-4 h-4" />,
  MONTHLY: <RefreshCcw className="w-4 h-4" />,
}

const INTERVAL_OPTS = ['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY'] as const

export default function SnapshotPoliciesPage() {
  const { data, isLoading, error } = useSWR('/api/storage/volumes', fetcher)
  const volumes: Volume[] = data?.volumes || []

  const [search, setSearch] = useState('')
  const [filterInterval, setFilterInterval] = useState('')
  const [filterZone, setFilterZone] = useState('')

  // Derive unique zones
  const zones = Array.from(new Set(volumes.map((v) => v.zonename).filter(Boolean)))

  const filtered = volumes.filter((v) => {
    if (search && !v.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filterZone && v.zonename !== filterZone) return false
    return true
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Snapshot Policies"
        description="Automate recurring snapshots for your volumes"
      />

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-300">About Snapshot Policies</p>
          <p className="text-sm text-blue-400/80 mt-1">
            Snapshot policies automate recurring snapshots for volumes. You can configure hourly, daily, weekly,
            or monthly snapshots. Policies are managed per volume and are executed by the CloudStack snapshot scheduler.
            Configure retention count to automatically remove older snapshots.
          </p>
        </div>
      </div>

      {/* Interval Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {INTERVAL_OPTS.map((interval) => (
          <div key={interval} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                {INTERVAL_ICONS[interval]}
              </div>
              <span className="text-sm font-medium text-white">{interval}</span>
            </div>
            <p className="text-xs text-slate-500">
              {interval === 'HOURLY' && 'Takes a snapshot every hour. High frequency, more storage usage.'}
              {interval === 'DAILY' && 'Takes one snapshot per day. Good balance of protection and storage.'}
              {interval === 'WEEKLY' && 'Takes one snapshot per week. Suitable for long-term backups.'}
              {interval === 'MONTHLY' && 'Monthly snapshot. Ideal for compliance and archive purposes.'}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search volumes..."
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterZone} onChange={(e) => setFilterZone(e.target.value)}
          className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Zones</option>
          {zones.map((z) => <option key={z} value={z}>{z}</option>)}
        </select>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          Failed to load volumes.
        </div>
      )}

      {/* Volume Table with Policy Management */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {['Volume Name', 'Type', 'Size', 'Zone', 'Account', 'Policy Schedule', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-800 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">No volumes found</td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-white">{v.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{v.id?.slice(0, 8)}...</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded text-xs font-medium',
                        v.type === 'ROOT' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400')}>
                        {v.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {v.size ? `${(v.size / 1073741824).toFixed(0)} GB` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">{v.zonename}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{v.account}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500 italic">No policy configured</span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-medium transition-colors">
                        Configure Policy
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
