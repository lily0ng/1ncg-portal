'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'
import { Download } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function UsagePage() {
  const today = new Date().toISOString().split('T')[0]
  const firstOfMonth = today.slice(0,8)+'01'
  const [startDate, setStartDate] = useState(firstOfMonth)
  const [endDate, setEndDate] = useState(today)
  const [applied, setApplied] = useState({start: firstOfMonth, end: today})
  const { data, isLoading, error, mutate } = useSWR(`/api/billing/usage?startdate=${applied.start}&enddate=${applied.end}`, fetcher)
  const records = data?.records || []
  const summary = data?.summary || {}

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Usage Records" description="Resource consumption details" />
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-wrap items-end gap-4">
        <div><label className="text-xs text-white/60 block mb-1">Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" /></div>
        <div><label className="text-xs text-white/60 block mb-1">End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" /></div>
        <button onClick={() => setApplied({start: startDate, end: endDate})} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm">Apply</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[['Total Records', records.length],['Total Cost', '$'+(summary.total||0).toFixed(2)],['Accounts', Object.keys(summary.byAccount||{}).length],['Resource Types', Object.keys(summary.byType||{}).length]].map(([l,v]) => (
          <div key={l as string} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-white/60 text-xs">{l}</div>
            <div className="text-2xl font-bold text-white mt-1">{v}</div>
          </div>
        ))}
      </div>
      {isLoading && <div className="animate-pulse h-40 bg-white/5 rounded-xl" />}
      {error && <div className="text-red-400 p-4 bg-red-400/10 rounded-xl">Failed. <button onClick={() => mutate()} className="underline">Retry</button></div>}
      {!isLoading && (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/10 text-white/60">
              {['Account','Resource','Type','Start','End','Usage','Cost'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
            </tr></thead>
            <tbody>
              {records.slice(0,100).map((r: any, i: number) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-2 text-white">{r.account}</td>
                  <td className="px-4 py-2 text-white/70 truncate max-w-32">{r.resourcename || r.usageid}</td>
                  <td className="px-4 py-2 text-white/70">{r.usagetype}</td>
                  <td className="px-4 py-2 text-white/60 text-xs">{r.startdate?.slice(0,10)}</td>
                  <td className="px-4 py-2 text-white/60 text-xs">{r.enddate?.slice(0,10)}</td>
                  <td className="px-4 py-2 text-white/70">{parseFloat(r.rawusage||'0').toFixed(2)}h</td>
                  <td className="px-4 py-2 text-green-400">${(r.cost||0).toFixed(4)}</td>
                </tr>
              ))}
              {records.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-white/40">No usage records</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  )
}