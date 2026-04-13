'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from 'recharts'

const fetcher = (url: string) => fetch(url).then(r => r.json())
const COLORS = ['#6366f1','#06b6d4','#22c55e','#f97316','#ec4899','#f59e0b']

export default function ReportsPage() {
  const today = new Date().toISOString().split('T')[0]
  const firstOfMonth = today.slice(0,8)+'01'
  const [start, setStart] = useState(firstOfMonth)
  const [end, setEnd] = useState(today)
  const [applied, setApplied] = useState({start: firstOfMonth, end: today})
  const { data, isLoading } = useSWR(`/api/billing/usage?startdate=${applied.start}&enddate=${applied.end}`, fetcher)
  const summary = data?.summary || {}
  const byType = Object.entries(summary.byType||{}).map(([name, value]) => ({name, value}))
  const byDay = Object.entries(summary.byDay||{}).map(([date, cost]) => ({date: date.slice(5), cost})).slice(-30)
  const byAccount = Object.entries(summary.byAccount||{}).map(([name, cost]) => ({name: name.slice(0,12), cost})).slice(0,10)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Billing Reports" description="Usage and revenue analytics" />
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-wrap items-end gap-4">
        <div><label className="text-xs text-white/60 block mb-1">Start Date</label>
          <input type="date" value={start} onChange={e => setStart(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" /></div>
        <div><label className="text-xs text-white/60 block mb-1">End Date</label>
          <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" /></div>
        <button onClick={() => setApplied({start, end})} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm">Generate</button>
      </div>
      {isLoading && <div className="animate-pulse h-80 bg-white/5 rounded-xl" />}
      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-medium text-white mb-4">Daily Cost Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={byDay}><XAxis dataKey="date" tick={{fill:'#ffffff60',fontSize:10}} /><YAxis tick={{fill:'#ffffff60',fontSize:10}} /><Tooltip contentStyle={{background:'#1a1a2e',border:'1px solid rgba(255,255,255,0.1)',color:'#fff'}} /><Line type="monotone" dataKey="cost" stroke="#6366f1" strokeWidth={2} dot={false} /></LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-medium text-white mb-4">Cost by Type</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart><Pie data={byType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name}) => name}>
                {byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie><Tooltip contentStyle={{background:'#1a1a2e',border:'1px solid rgba(255,255,255,0.1)',color:'#fff'}} /></PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 lg:col-span-2">
            <h3 className="text-sm font-medium text-white mb-4">Top Accounts by Cost</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byAccount}><XAxis dataKey="name" tick={{fill:'#ffffff60',fontSize:10}} /><YAxis tick={{fill:'#ffffff60',fontSize:10}} /><Tooltip contentStyle={{background:'#1a1a2e',border:'1px solid rgba(255,255,255,0.1)',color:'#fff'}} /><Bar dataKey="cost" fill="#6366f1" radius={[4,4,0,0]} /></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </motion.div>
  )
}