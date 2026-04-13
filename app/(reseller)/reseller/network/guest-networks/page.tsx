'use client'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ResellerNetworksPage() {
  const { data, isLoading, mutate } = useSWR('/api/network/networks', fetcher)
  const networks: any[] = Array.isArray(data) ? data : (data?.networks || [])
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Customer Networks" />
      {isLoading && <div className="animate-pulse h-40 bg-white/5 rounded-xl" />}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10 text-white/60">{['Name','State','Type','CIDR','Zone','Account','Created'].map(h=><th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr></thead>
          <tbody>
            {networks.map((n: any) => (
              <tr key={n.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 text-white">{n.name}</td>
                <td className="px-4 py-3"><StatusBadge status={n.state} /></td>
                <td className="px-4 py-3 text-white/70">{n.type}</td>
                <td className="px-4 py-3 text-white/70 font-mono text-xs">{n.cidr||'-'}</td>
                <td className="px-4 py-3 text-white/70">{n.zonename}</td>
                <td className="px-4 py-3 text-white/70">{n.account}</td>
                <td className="px-4 py-3 text-white/60">{n.created ? new Date(n.created).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
            {networks.length===0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-white/40">No networks</td></tr>}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}