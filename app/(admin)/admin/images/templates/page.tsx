'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function TemplatesPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/images/templates', fetcher)
  const { data: zones } = useSWR('/api/zones', fetcher)
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name:'', displaytext:'', url:'', format:'QCOW2', zoneid:'', ostypeid:'', hypervisor:'KVM' })
  const templates: any[] = Array.isArray(data) ? data : (data?.templates || [])
  const zoneList: any[] = zones?.zones || []
  const filtered = templates.filter((t: any) => t.name?.toLowerCase().includes(search.toLowerCase()))

  const handleCreate = async () => {
    if (!form.name||!form.url||!form.zoneid) { toast.error('Name, URL, and Zone required'); return }
    try {
      const res = await fetch('/api/images/templates', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
      if (!res.ok) throw new Error()
      toast.success('Template registered'); mutate(); setShowCreate(false)
    } catch { toast.error('Failed') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete template?')) return
    try { await fetch(`/api/images/templates/${id}`, { method:'DELETE' }); toast.success('Deleted'); mutate() }
    catch { toast.error('Failed') }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Templates" description="OS templates for VM deployment" actions={
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"><Plus className="w-4 h-4" /> Register Template</button>
      } />
      <div className="flex gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates..." className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm flex-1 max-w-xs" />
      </div>
      {isLoading && <div className="animate-pulse h-40 bg-white/5 rounded-xl" />}
      {error && <div className="text-red-400 p-4 bg-red-400/10 rounded-xl">Failed. <button onClick={() => mutate()} className="underline">Retry</button></div>}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10 text-white/60">
            {['Name','OS','Format','Zone','Hypervisor','Public','Ready','Created','Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((t: any) => (
              <tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 text-white font-medium">{t.name}</td>
                <td className="px-4 py-3 text-white/70">{t.ostypename||'-'}</td>
                <td className="px-4 py-3 text-white/70">{t.format}</td>
                <td className="px-4 py-3 text-white/70">{t.zonename}</td>
                <td className="px-4 py-3 text-white/70">{t.hypervisor}</td>
                <td className="px-4 py-3"><span className={t.ispublic ? 'text-green-400' : 'text-white/40'}>{t.ispublic ? 'Yes' : 'No'}</span></td>
                <td className="px-4 py-3"><span className={t.isready ? 'text-green-400' : 'text-yellow-400'}>{t.isready ? 'Ready' : 'Processing'}</span></td>
                <td className="px-4 py-3 text-white/60">{t.created ? new Date(t.created).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3"><button onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
            {filtered.length===0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-white/40">No templates</td></tr>}
          </tbody>
        </table>
      </div>
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-lg space-y-4 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-white">Register Template</h3>
            {[['Name','name'],['Display Text','displaytext'],['URL','url'],['OS Type ID','ostypeid']].map(([l,k]) => (
              <div key={k}><label className="text-sm text-white/60 block mb-1">{l}</label><input value={(form as any)[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" /></div>
            ))}
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm text-white/60 block mb-1">Format</label>
                <select value={form.format} onChange={e => setForm(f => ({...f, format: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                  {['QCOW2','VHD','OVA','RAW','VMDK'].map(f => <option key={f}>{f}</option>)}
                </select></div>
              <div><label className="text-sm text-white/60 block mb-1">Zone</label>
                <select value={form.zoneid} onChange={e => setForm(f => ({...f, zoneid: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                  <option value="">Select Zone</option>{zoneList.map((z:any) => <option key={z.id} value={z.id}>{z.name}</option>)}
                </select></div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleCreate} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm">Register</button>
              <button onClick={() => setShowCreate(false)} className="flex-1 bg-white/10 text-white py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}