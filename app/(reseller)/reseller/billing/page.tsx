'use client'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ResellerBillingPage() {
  const { data: usage } = useSWR('/api/billing/usage', fetcher)
  const { data: invoices } = useSWR('/api/billing/invoices', fetcher)
  const summary = usage?.summary || {}
  const invList: any[] = Array.isArray(invoices) ? invoices : (invoices?.invoices || [])
  const byAccount = Object.entries(summary.byAccount||{}).map(([name, cost]) => ({name: name.slice(0,10), cost})).slice(0,8)
  const unpaid = invList.filter(i => i.status==='UNPAID').length
  const total = summary.total || 0

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Billing Overview" description="Revenue and invoice summary" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[['Revenue This Month','$'+total.toFixed(2)],['Unpaid Invoices',unpaid],['Total Invoices',invList.length],['Accounts',Object.keys(summary.byAccount||{}).length]].map(([l,v]) => (
          <div key={l as string} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-white/60 text-xs">{l}</div><div className="text-2xl font-bold text-white mt-1">{v}</div>
          </div>
        ))}
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-medium text-white mb-4">Revenue by Customer</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={byAccount}><XAxis dataKey="name" tick={{fill:'#ffffff60',fontSize:10}}/><YAxis tick={{fill:'#ffffff60',fontSize:10}}/><Tooltip contentStyle={{background:'#1a1a2e',border:'1px solid rgba(255,255,255,0.1)',color:'#fff'}}/><Bar dataKey="cost" fill="#6366f1" radius={[4,4,0,0]}/></BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}