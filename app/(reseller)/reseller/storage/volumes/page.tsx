'use client'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ResellerVolumesPage() {
  const { data, isLoading, mutate } = useSWR('/api/storage/volumes', fetcher)
  const volumes: any[] = Array.isArray(data) ? data : (data?.volumes || [])
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Customer Volumes" />
      {isLoading && <div className="animate-pulse h-40 bg-white/5 rounded-xl" />}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10 text-white/60">{['Name','State','Type','Size','VM','Account','Zone','Created'].map(h=><th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr></thead>
          <tbody>
            {volumes.map((v: any) => (
              <tr key={v.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 text-white">{v.name}</td>
                <td className="px-4 py-3"><StatusBadge status={v.state} /></td>
                <td className="px-4 py-3 text-white/70">{v.type}</td>
                <td className="px-4 py-3 text-white/70">{v.size ? (v.size/1073741824).toFixed(0)+'GB' : '-'}</td>
                <td className="px-4 py-3 text-white/70">{v.vmname||'-'}</td>
                <td className="px-4 py-3 text-white/70">{v.account}</td>
                <td className="px-4 py-3 text-white/70">{v.zonename}</td>
                <td className="px-4 py-3 text-white/60">{v.created ? new Date(v.created).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
            {volumes.length===0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-white/40">No volumes</td></tr>}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}