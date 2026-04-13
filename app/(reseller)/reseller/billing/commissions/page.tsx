'use client'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ResellerCommissionsPage() {
  const { data } = useSWR('/api/billing/usage', fetcher)
  const summary = data?.summary || {}
  const total = summary.total || 0
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="My Commissions" description="Commission earnings from customer usage" />
      <div className="grid grid-cols-3 gap-4">
        {[['Total Revenue','$'+total.toFixed(2)],['Commission Rate','10%'],['Commission Earned','$'+(total*0.10).toFixed(2)]].map(([l,v]) => (
          <div key={l as string} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-white/60 text-xs">{l}</div><div className="text-2xl font-bold text-white mt-1">{v}</div>
          </div>
        ))}
      </div>
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-sm text-indigo-300">Commission is calculated monthly based on total customer resource usage. Contact your administrator to adjust commission rates.</div>
    </motion.div>
  )
}