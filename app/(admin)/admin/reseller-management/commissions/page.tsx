'use client'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function CommissionsPage() {
  const { data } = useSWR('/api/resellers', fetcher)
  const resellers: any[] = Array.isArray(data) ? data : []

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Commission Management" description="Track reseller commissions" />
      <div className="grid grid-cols-3 gap-4">
        {[['Total Resellers',resellers.length],['Avg Commission %', resellers.length ? (resellers.reduce((s,r)=>s+(r.commission||0),0)/resellers.length*100).toFixed(1)+'%' : '0%'],['Total Customers',resellers.reduce((s,r)=>s+(r.customerCount||0),0)]].map(([l,v]) => (
          <div key={l as string} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-white/60 text-xs">{l}</div><div className="text-2xl font-bold text-white mt-1">{v}</div>
          </div>
        ))}
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10 text-white/60">
            {['Reseller','Email','Customers','Commission Rate','Markup Rate','Status'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
          </tr></thead>
          <tbody>
            {resellers.map((r: any) => (
              <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 text-white">{r.name}</td>
                <td className="px-4 py-3 text-white/70">{r.email}</td>
                <td className="px-4 py-3 text-white/70">{r.customerCount||0}</td>
                <td className="px-4 py-3 text-white/70">{((r.commission||0)*100).toFixed(0)}%</td>
                <td className="px-4 py-3 text-white/70">{((r.markupPct||0)*100).toFixed(0)}%</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${r.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{r.active ? 'Active' : 'Inactive'}</span></td>
              </tr>
            ))}
            {resellers.length===0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-white/40">No resellers</td></tr>}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}