'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { toast } from 'sonner'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ResellerInvoicesPage() {
  const { data, mutate } = useSWR('/api/billing/invoices', fetcher)
  const invoices: any[] = Array.isArray(data) ? data : (data?.invoices || [])

  const markPaid = async (id: string) => {
    try {
      await fetch(`/api/billing/invoices/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({status:'PAID'}) })
      toast.success('Marked as paid'); mutate()
    } catch { toast.error('Failed') }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Customer Invoices" />
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10 text-white/60">
            {['Invoice#','Customer','Amount','Status','Due','Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
          </tr></thead>
          <tbody>
            {invoices.map((inv: any) => (
              <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 text-indigo-400 font-mono text-xs">{inv.invoiceNo?.slice(0,12)}</td>
                <td className="px-4 py-3 text-white">{inv.user?.username||inv.userId}</td>
                <td className="px-4 py-3 text-white">${(inv.amount||0).toFixed(2)}</td>
                <td className="px-4 py-3"><StatusBadge status={inv.status?.toLowerCase()||'unpaid'} /></td>
                <td className="px-4 py-3 text-white/60">{inv.dueAt ? new Date(inv.dueAt).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3">{inv.status!=='PAID' && <button onClick={() => markPaid(inv.id)} className="text-xs text-green-400 hover:text-green-300">Mark Paid</button>}</td>
              </tr>
            ))}
            {invoices.length===0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-white/40">No invoices</td></tr>}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}