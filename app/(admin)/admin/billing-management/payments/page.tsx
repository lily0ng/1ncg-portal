'use client'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function PaymentsPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/billing/payments', fetcher)
  const payments = Array.isArray(data) ? data : (data?.invoices || data?.payments || [])
  const total = payments.reduce((s: number, p: any) => s + (p.amount||0), 0)
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Payments" description="Payment history" />
      <div className="grid grid-cols-3 gap-4">
        {[['Total Payments', payments.length],['Total Amount', '$'+total.toFixed(2)],['This Month', '$'+(payments.filter((p:any)=>p.paidAt?.slice(0,7)===new Date().toISOString().slice(0,7)).reduce((s:number,p:any)=>s+(p.amount||0),0)).toFixed(2)]].map(([l,v]) => (
          <div key={l as string} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-white/60 text-xs">{l}</div><div className="text-2xl font-bold text-white mt-1">{v}</div>
          </div>
        ))}
      </div>
      {isLoading && <div className="animate-pulse h-40 bg-white/5 rounded-xl" />}
      {error && <div className="text-red-400 p-4 bg-red-400/10 rounded-xl">Failed. <button onClick={() => mutate()} className="underline">Retry</button></div>}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10 text-white/60">
            {['Invoice#','Account','Amount (USD)','Amount (MMK)','Paid Date'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
          </tr></thead>
          <tbody>
            {payments.map((p: any) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 text-indigo-400">{p.invoiceNo || p.id?.slice(0,8)}</td>
                <td className="px-4 py-3 text-white">{p.user?.username || p.userId}</td>
                <td className="px-4 py-3 text-green-400">${(p.amount||0).toFixed(2)}</td>
                <td className="px-4 py-3 text-white/70">{(p.amountMMK||0).toLocaleString()} MMK</td>
                <td className="px-4 py-3 text-white/60">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
            {payments.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-white/40">No payments found</td></tr>}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}