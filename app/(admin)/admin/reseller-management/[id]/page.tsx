'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { toast } from 'sonner'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ResellerDetailPage() {
  const { id } = useParams() as { id: string }
  const [activeTab, setActiveTab] = useState('overview')
  const { data, mutate } = useSWR(`/api/resellers/${id}`, fetcher)
  const { data: customers } = useSWR(activeTab==='customers' ? `/api/resellers/${id}/customers` : null, fetcher)
  const reseller = data || {}
  const accts: any[] = Array.isArray(customers) ? customers : (customers?.account || [])

  const handleUpdate = async (field: string, value: any) => {
    try {
      await fetch(`/api/resellers/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({[field]: value}) })
      toast.success('Updated'); mutate()
    } catch { toast.error('Failed') }
  }

  const tabs = ['overview','customers','billing']

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title={reseller.name || 'Reseller'} description={reseller.email} />
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit">
        {tabs.map(t => <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${activeTab===t ? 'bg-indigo-600 text-white' : 'text-white/60 hover:text-white'}`}>{t}</button>)}
      </div>
      {activeTab==='overview' && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="grid grid-cols-2 gap-4">
            {[['ID',reseller.id],['Name',reseller.name],['Email',reseller.email],['Domain',reseller.domainId],['Customers',reseller.customers?.length||0],['Status',reseller.active ? 'Active' : 'Inactive'],['Created',reseller.createdAt ? new Date(reseller.createdAt).toLocaleDateString() : '-']].map(([l,v]) => (
              <div key={l as string}><div className="text-xs text-white/60">{l}</div><div className="text-white mt-0.5">{v as string}</div></div>
            ))}
            <div>
              <div className="text-xs text-white/60 mb-1">Commission %</div>
              <div className="flex gap-2">
                <input type="number" defaultValue={((reseller.commission||0)*100).toFixed(0)} onBlur={e => handleUpdate('commission', +e.target.value/100)} className="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-sm" />
              </div>
            </div>
            <div>
              <div className="text-xs text-white/60 mb-1">Markup %</div>
              <div className="flex gap-2">
                <input type="number" defaultValue={((reseller.markupPct||0)*100).toFixed(0)} onBlur={e => handleUpdate('markupPct', +e.target.value/100)} className="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-sm" />
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab==='customers' && (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/10 text-white/60">
              {['Name','Email','Domain','State','Created'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
            </tr></thead>
            <tbody>
              {accts.map((a: any) => <tr key={a.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 text-white">{a.name}</td>
                <td className="px-4 py-3 text-white/70">{a.email || '-'}</td>
                <td className="px-4 py-3 text-white/70">{a.domain}</td>
                <td className="px-4 py-3"><StatusBadge status={a.state} /></td>
                <td className="px-4 py-3 text-white/60">{a.created ? new Date(a.created).toLocaleDateString() : '-'}</td>
              </tr>)}
              {accts.length===0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-white/40">No customers</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {activeTab==='billing' && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-white/60 text-sm">Billing summary for this reseller's customers.</p>
        </div>
      )}
    </motion.div>
  )
}