'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'
import { RefreshCw, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function SyncCloudStackPage() {
  const { data, mutate } = useSWR('/api/sync', fetcher, { revalidateOnMount: true })
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const lastSync = data?.lastSync
  const logs: any[] = data?.logs || []

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/sync', { method: 'POST' })
      const r = await res.json()
      if (!res.ok) throw new Error(r.error)
      setResult(r)
      toast.success('Sync complete')
      mutate()
    } catch (e: any) { toast.error(e.message || 'Sync failed') }
    finally { setSyncing(false) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Sync CloudStack" description="Synchronize resources from CloudStack API" />
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-white font-medium">
            <Clock className="w-5 h-5 text-indigo-400" /> Last Sync
          </div>
          <div className="text-white/60 text-sm mt-1">{lastSync ? new Date(lastSync.syncedAt).toLocaleString() : 'Never synced'}</div>
          {lastSync && <div className="text-white/40 text-xs mt-0.5">Duration: {lastSync.duration}ms | VMs: {lastSync.vmCount} | Volumes: {lastSync.volumeCount}</div>}
        </div>
        <button onClick={handleSync} disabled={syncing} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium">
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>
      {result && (
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center gap-2 text-green-400 font-medium mb-4"><CheckCircle className="w-5 h-5" /> Sync Complete — {result.duration}ms</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(result.counts||{}).map(([k,v]) => (
              <div key={k} className="bg-white/5 rounded-lg p-3">
                <div className="text-white/60 text-xs capitalize">{k}</div>
                <div className="text-2xl font-bold text-white">{v as number}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 text-sm font-medium text-white">Sync History</div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10 text-white/60">
            {['Date','VMs','Volumes','Networks','Hosts','Status','Duration'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
          </tr></thead>
          <tbody>
            {logs.map((l: any) => (
              <tr key={l.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 text-white">{new Date(l.syncedAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-white/70">{l.vmCount}</td>
                <td className="px-4 py-3 text-white/70">{l.volumeCount}</td>
                <td className="px-4 py-3 text-white/70">{l.netCount}</td>
                <td className="px-4 py-3 text-white/70">{l.hostCount}</td>
                <td className="px-4 py-3"><span className="text-green-400">{l.status}</span></td>
                <td className="px-4 py-3 text-white/60">{l.duration}ms</td>
              </tr>
            ))}
            {logs.length===0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-white/40">No sync history</td></tr>}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}