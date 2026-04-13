'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { ArrowLeft, Trash2, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const tabs = ['Overview', 'Snapshots', 'Events']

interface Volume {
  id: string
  name: string
  state: string
  type: string
  size: number
  vmname?: string
  vmid?: string
  zonename: string
  zoneid?: string
  storage?: string
  storageid?: string
  account: string
  domainid?: string
  domain?: string
  created: string
  diskofferingname?: string
  diskofferingid?: string
  serviceofferingname?: string
}

interface Snapshot {
  id: string
  name: string
  state: string
  volumeid: string
  volumename: string
  size?: number
  intervaltype?: string
  zonename?: string
  account: string
  created: string
}

interface Event {
  id: string
  type: string
  description: string
  level: string
  state?: string
  username?: string
  created: string
}

function InfoRow({ label, value }: { label: string; value?: string | number | React.ReactNode }) {
  return (
    <div className="py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 border-b border-slate-800/60 last:border-0">
      <dt className="text-sm text-slate-500 sm:w-40 flex-shrink-0">{label}</dt>
      <dd className="text-sm text-slate-200 font-medium break-all">{value ?? '-'}</dd>
    </div>
  )
}

export default function VolumeDetailPage() {
  const _p = useParams<{ id: string }>()
  const id = _p?.id ?? ''
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('Overview')

  const { data: volData, isLoading, error } = useSWR(`/api/storage/volumes/${id}`, fetcher)
  const { data: snapshotsData } = useSWR('/api/storage/snapshots', fetcher)
  const { data: eventsData } = useSWR(`/api/events?resourceid=${id}`, fetcher)

  const volume: Volume | null = volData?.volume?.[0] || volData?.volume || null
  const allSnapshots: Snapshot[] = snapshotsData?.snapshot || []
  const snapshots = allSnapshots.filter((s) => s.volumeid === id)
  const events: Event[] = eventsData?.event || []

  const handleDeleteSnapshot = async (snapshotId: string) => {
    try {
      const res = await fetch(`/api/storage/snapshots/${snapshotId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Snapshot deleted')
    } catch {
      toast.error('Failed to delete snapshot')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-800 rounded-lg w-64 animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !volume) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
        Failed to load volume details.
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      <PageHeader
        title={volume.name}
        description={`Volume ID: ${volume.id}`}
        action={<StatusBadge status={volume.state} />}
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === tab
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'Overview' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-900/50 border border-slate-800 rounded-xl p-6"
        >
          <dl className="divide-y divide-slate-800/60">
            <InfoRow label="ID" value={<span className="font-mono text-xs">{volume.id}</span>} />
            <InfoRow label="Name" value={volume.name} />
            <InfoRow label="Type" value={
              <span className={cn('px-2 py-0.5 rounded text-xs font-medium',
                volume.type === 'ROOT' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
              )}>
                {volume.type}
              </span>
            } />
            <InfoRow label="Size" value={volume.size ? `${(volume.size / 1073741824).toFixed(2)} GB` : '-'} />
            <InfoRow label="State" value={<StatusBadge status={volume.state} />} />
            <InfoRow label="Storage Pool" value={volume.storage} />
            <InfoRow label="Zone" value={volume.zonename} />
            <InfoRow label="Account" value={volume.account} />
            <InfoRow label="Domain" value={volume.domain} />
            <InfoRow label="VM Attached" value={volume.vmname || 'None'} />
            <InfoRow label="Disk Offering" value={volume.diskofferingname} />
            <InfoRow label="Created" value={volume.created ? new Date(volume.created).toLocaleString() : '-'} />
          </dl>
        </motion.div>
      )}

      {/* Snapshots Tab */}
      {activeTab === 'Snapshots' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {snapshots.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-slate-900/50 border border-slate-800 rounded-xl">
              No snapshots found for this volume.
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    {['Name', 'State', 'Size', 'Interval', 'Account', 'Created', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {snapshots.map((s) => (
                    <tr key={s.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-white">{s.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{s.id?.slice(0, 8)}...</p>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={s.state} /></td>
                      <td className="px-4 py-3 text-sm text-slate-300">{s.size ? `${(s.size / 1073741824).toFixed(2)} GB` : '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{s.intervaltype || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{s.account}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{s.created ? new Date(s.created).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteSnapshot(s.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
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
      )}

      {/* Events Tab */}
      {activeTab === 'Events' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {events.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-slate-900/50 border border-slate-800 rounded-xl">
              No events found.
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((evt) => (
                <div key={evt.id} className="flex gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className={cn('w-2 h-2 rounded-full mt-1.5',
                      evt.level === 'ERROR' ? 'bg-red-500' : evt.level === 'WARN' ? 'bg-yellow-500' : 'bg-blue-500'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-white">{evt.type}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-500 flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        {evt.created ? new Date(evt.created).toLocaleString() : '-'}
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5">{evt.description}</p>
                    {evt.username && <p className="text-xs text-slate-600 mt-1">by {evt.username}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
