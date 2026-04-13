'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'
import { Plus, Edit, Trash2, Check } from 'lucide-react'
import { toast } from 'sonner'

const fetcher = (url: string) => fetch(url).then(r => r.json())
const FIELDS: [string, string, string][] = [
  ['Plan Name','name','text'],['VM Running ($/hr)','vmRunningHr','number'],['VM Allocated ($/hr)','vmAllocHr','number'],
  ['Public IP ($/hr)','publicIpHr','number'],['Storage ($/GB/mo)','storageGbMonth','number'],
  ['Snapshot ($/GB)','snapshotGb','number'],['LB Rule ($/hr)','lbRuleHr','number'],['VPN User ($/hr)','vpnUserHr','number'],
]

export default function PricingPlansPage() {
  const { data, mutate } = useSWR('/api/pricing/plans', fetcher)
  const plans: any[] = Array.isArray(data) ? data : (data?.plans || [])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<any>({ name:'', vmRunningHr:0.05, vmAllocHr:0.01, publicIpHr:0.004, storageGbMonth:0.10, snapshotGb:0.02, lbRuleHr:0.01, vpnUserHr:0.005 })

  const openCreate = () => { setEditing(null); setForm({ name:'', vmRunningHr:0.05, vmAllocHr:0.01, publicIpHr:0.004, storageGbMonth:0.10, snapshotGb:0.02, lbRuleHr:0.01, vpnUserHr:0.005 }); setShowModal(true) }
  const openEdit = (p: any) => { setEditing(p); setForm({...p}); setShowModal(true) }

  const handleSave = async () => {
    try {
      const url = editing ? `/api/pricing/plans/${editing.id}` : '/api/pricing/plans'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify({...form, vmRunningHr:+form.vmRunningHr, vmAllocHr:+form.vmAllocHr, publicIpHr:+form.publicIpHr, storageGbMonth:+form.storageGbMonth, snapshotGb:+form.snapshotGb, lbRuleHr:+form.lbRuleHr, vpnUserHr:+form.vpnUserHr}) })
      if (!res.ok) throw new Error()
      toast.success(editing ? 'Plan updated' : 'Plan created'); mutate(); setShowModal(false)
    } catch { toast.error('Failed to save plan') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete plan?')) return
    try {
      await fetch(`/api/pricing/plans/${id}`, { method: 'DELETE' })
      toast.success('Deleted'); mutate()
    } catch { toast.error('Failed') }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Pricing Plans" actions={
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"><Plus className="w-4 h-4" /> Add Plan</button>
      } />
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10 text-white/60">
            {['Name','VM/hr','IP/hr','Storage/GB-mo','Active','Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
          </tr></thead>
          <tbody>
            {plans.map((p: any) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 text-white font-medium">{p.name}</td>
                <td className="px-4 py-3 text-white/70">${p.vmRunningHr}</td>
                <td className="px-4 py-3 text-white/70">${p.publicIpHr}</td>
                <td className="px-4 py-3 text-white/70">${p.storageGbMonth}</td>
                <td className="px-4 py-3">{p.active ? <span className="flex items-center gap-1 text-green-400"><Check className="w-3 h-3" />Active</span> : <span className="text-white/40">Inactive</span>}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(p)} className="text-indigo-400 hover:text-indigo-300"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {plans.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-white/40">No plans</td></tr>}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-md space-y-3 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-white">{editing ? 'Edit Plan' : 'Create Plan'}</h3>
            {FIELDS.map(([label, key, type]) => (
              <div key={key}><label className="text-xs text-white/60 block mb-1">{label}</label>
                <input type={type} step="0.0001" value={form[key]||''} onChange={e => setForm((f: any) => ({...f, [key]: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" /></div>
            ))}
            <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
              <input type="checkbox" checked={form.active||false} onChange={e => setForm((f: any) => ({...f, active: e.target.checked}))} className="rounded" /> Set as Active Plan
            </label>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm">Save</button>
              <button onClick={() => setShowModal(false)} className="flex-1 bg-white/10 text-white py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}