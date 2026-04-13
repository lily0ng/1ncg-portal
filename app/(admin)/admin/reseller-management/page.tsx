'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Plus, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ResellerManagementPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/resellers', fetcher)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name:'', email:'', commission:'10', markupPct:'20' })
  const resellers: any[] = Array.isArray(data) ? data : []

  const handleCreate = async () => {
    if (!form.name || !form.email) { toast.error('Name and email required'); return }
    try {
      const res = await fetch('/api/resellers', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({...form, commission: +form.commission/100, markupPct: +form.markupPct/100}) })
      if (!res.ok) throw new Error()
      toast.success('Reseller created'); mutate(); setShowCreate(false)
    } catch { toast.error('Failed to create reseller') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete reseller?')) return
    try {
      await fetch(`/api/resellers/${id}`, { method:'DELETE' })
      toast.success('Deleted'); mutate()
    } catch { toast.error('Failed') }
  }

  const stats = {total: resellers.length, active: resellers.filter(r => r.active).length, customers: resellers.reduce((s,r) => s+(r.customerCount||0),0)}

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Reseller Management" description="Manage reseller accounts" actions={
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"><Plus className="w-4 h-4" /> Add Reseller</button>
      } />
      <div className="grid grid-cols-3 gap-4">
        {[['Total Resellers',stats.total],['Active Resellers',stats.active],['Total Customers',stats.customers]].map(([l,v]) => (
          <div key={l as string} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-white/60 text-xs">{l}</div><div className="text-2xl font-bold text-white mt-1">{v}</div>
          </div>
        ))}
      </div>
      {isLoading && <div className="animate-pulse h-40 bg-white/5 rounded-xl" />}
      {error && <div className="text-red-400 p-4 bg-red-400/10 rounded-xl">Failed. <button onClick={() => mutate()} className="underline">Retry</button></div>}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10 text-white/60">
            {['Name','Email','Customers','Commission%','Markup%','Status','Created','Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
          </tr></thead>
          <tbody>
            {resellers.map((r: any) => (
              <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 text-white font-medium">{r.name}</td>
                <td className="px-4 py-3 text-white/70">{r.email}</td>
                <td className="px-4 py-3 text-white/70">{r.customerCount||0}</td>
                <td className="px-4 py-3 text-white/70">{((r.commission||0)*100).toFixed(0)}%</td>
                <td className="px-4 py-3 text-white/70">{((r.markupPct||0)*100).toFixed(0)}%</td>
                <td className="px-4 py-3"><StatusBadge status={r.active ? 'active' : 'disabled'} /></td>
                <td className="px-4 py-3 text-white/60">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3 flex gap-2">
                  <Link href={`/admin/reseller-management/${r.id}`} className="text-indigo-400 hover:text-indigo-300"><Eye className="w-4 h-4" /></Link>
                  <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {resellers.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-white/40">No resellers</td></tr>}
          </tbody>
        </table>
      </div>
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-white">Add Reseller</h3>
            {[['Name','name','text'],['Email','email','email'],['Commission %','commission','number'],['Markup %','markupPct','number']].map(([l,k,t]) => (
              <div key={k}><label className="text-sm text-white/60 block mb-1">{l}</label>
              <input type={t} value={(form as any)[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" /></div>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={handleCreate} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm">Create</button>
              <button onClick={() => setShowCreate(false)} className="flex-1 bg-white/10 text-white py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}