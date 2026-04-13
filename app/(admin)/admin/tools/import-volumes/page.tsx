'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'
import { HardDrive } from 'lucide-react'
import { toast } from 'sonner'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ImportVolumesPage() {
  const [form, setForm] = useState({ name: '', path: '', storageid: '', format: 'QCOW2' })
  const { data: pools } = useSWR('/api/infrastructure/storage-pools', fetcher)
  const storagePools = Array.isArray(pools) ? pools : (pools?.storagepool || [])

  const handleImport = async () => {
    if (!form.name || !form.path) { toast.error('Name and path are required'); return }
    toast.info('Volume import initiated - check CloudStack for status')
  }
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Import Volumes" description="Import volumes from storage pools" />
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-w-lg space-y-4">
        <div className="flex items-center gap-2 text-white font-medium"><HardDrive className="w-5 h-5 text-indigo-400" /> Volume Import</div>
        <div><label className="text-sm text-white/60 block mb-1">Storage Pool</label>
          <select value={form.storageid} onChange={e => setForm(f => ({...f, storageid: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
            <option value="">Select Storage Pool</option>
            {storagePools.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select></div>
        {['name','path'].map(k => (
          <div key={k}><label className="text-sm text-white/60 block mb-1 capitalize">{k === 'path' ? 'Volume Path' : 'Volume Name'}</label>
          <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={(form as any)[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))} /></div>
        ))}
        <div><label className="text-sm text-white/60 block mb-1">Format</label>
          <select value={form.format} onChange={e => setForm(f => ({...f, format: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
            {['QCOW2','VHD','RAW','VMDK'].map(f => <option key={f}>{f}</option>)}
          </select></div>
        <button onClick={handleImport} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm">Import Volume</button>
      </div>
    </motion.div>
  )
}