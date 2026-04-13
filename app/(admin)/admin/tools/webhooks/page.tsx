'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { Plus, Trash2, Webhook } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'

const fetcher = (url: string) => fetch(url).then(r => r.json())
const EVENTS = ['VM.CREATE','VM.DESTROY','VM.START','VM.STOP','VM.REBOOT','NETWORK.CREATE','NETWORK.DELETE','VOLUME.CREATE','VOLUME.DELETE','SNAPSHOT.CREATE','USER.LOGIN']

export default function WebhooksPage() {
  const { data, error, isLoading, mutate } = useSWR('/api/webhooks', fetcher)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', payloadurl: '', scope: 'Local', sslverification: 'true', events: [] as string[] })
  const webhooks = Array.isArray(data) ? data : (data?.webhook || [])

  const handleCreate = async () => {
    if (!form.name || !form.payloadurl) { toast.error('Name and URL required'); return }
    try {
      const res = await fetch('/api/webhooks', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({...form, events: form.events.join(',')}) })
      if (!res.ok) throw new Error('Failed')
      toast.success('Webhook created'); mutate(); setShowCreate(false)
    } catch { toast.error('Failed to create webhook') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this webhook?')) return
    try {
      await fetch('/api/webhooks?id='+id, { method: 'DELETE' })
      toast.success('Webhook deleted'); mutate()
    } catch { toast.error('Failed to delete') }
  }

  const toggleEvent = (e: string) => setForm(f => ({ ...f, events: f.events.includes(e) ? f.events.filter(x => x !== e) : [...f.events, e] }))

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Webhooks" description="Configure CloudStack event webhooks" actions={
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"><Plus className="w-4 h-4" /> Create Webhook</button>
      } />
      {isLoading && <div className="animate-pulse h-40 bg-white/5 rounded-xl" />}
      {error && <div className="text-red-400 p-4 bg-red-400/10 rounded-xl">Failed to load. <button onClick={() => mutate()} className="underline">Retry</button></div>}
      {!isLoading && !error && (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/10 text-white/60">
              {['Name','Payload URL','Scope','SSL Verify','State','Created','Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
            </tr></thead>
            <tbody>
              {webhooks.map((w: any) => (
                <tr key={w.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-white font-medium">{w.name}</td>
                  <td className="px-4 py-3 text-white/70 truncate max-w-48">{w.payloadurl}</td>
                  <td className="px-4 py-3 text-white/70">{w.scope}</td>
                  <td className="px-4 py-3 text-white/70">{w.sslverification === 'true' ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3"><StatusBadge status={w.state || 'enabled'} /></td>
                  <td className="px-4 py-3 text-white/60">{w.created ? new Date(w.created).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3"><button onClick={() => handleDelete(w.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
              {webhooks.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-white/40">No webhooks configured</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-lg space-y-4 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-white">Create Webhook</h3>
            <div><label className="text-sm text-white/60 block mb-1">Name</label><input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" /></div>
            <div><label className="text-sm text-white/60 block mb-1">Payload URL</label><input value={form.payloadurl} onChange={e => setForm(f => ({...f, payloadurl: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" placeholder="https://..." /></div>
            <div className="flex gap-4">
              <div className="flex-1"><label className="text-sm text-white/60 block mb-1">Scope</label>
                <select value={form.scope} onChange={e => setForm(f => ({...f, scope: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                  <option value="Local">Local</option><option value="Global">Global</option>
                </select></div>
              <div className="flex-1"><label className="text-sm text-white/60 block mb-1">SSL Verify</label>
                <select value={form.sslverification} onChange={e => setForm(f => ({...f, sslverification: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                  <option value="true">Yes</option><option value="false">No</option>
                </select></div>
            </div>
            <div><label className="text-sm text-white/60 block mb-2">Events</label>
              <div className="grid grid-cols-2 gap-1">{EVENTS.map(e => (
                <label key={e} className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                  <input type="checkbox" checked={form.events.includes(e)} onChange={() => toggleEvent(e)} className="rounded" />{e}
                </label>))}</div></div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleCreate} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm">Create</button>
              <button onClick={() => setShowCreate(false)} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}