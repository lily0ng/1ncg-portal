'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'
import { Upload, Download } from 'lucide-react'
import { toast } from 'sonner'

export default function ImportExportPage() {
  const [form, setForm] = useState({ name: '', url: '', format: 'QCOW2', zoneid: '' })
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Import/Export" description="Import templates and ISOs" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-medium"><Upload className="w-5 h-5 text-indigo-400" /> Import Template</div>
          {['name','url','zoneid'].map(k => (
            <div key={k}><label className="text-sm text-white/60 block mb-1 capitalize">{k === 'zoneid' ? 'Zone ID' : k}</label>
            <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={(form as any)[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))} /></div>
          ))}
          <div><label className="text-sm text-white/60 block mb-1">Format</label>
          <select value={form.format} onChange={e => setForm(f => ({...f, format: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
            {['QCOW2','VHD','OVA','RAW'].map(f => <option key={f}>{f}</option>)}
          </select></div>
          <button onClick={() => toast.info('Use Register Template for URL imports')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm">Import Template</button>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-medium"><Download className="w-5 h-5 text-green-400" /> Export Template</div>
          <p className="text-sm text-white/60">Export templates from CloudStack to external storage for backup or migration</p>
          <button onClick={() => toast.info('Navigate to Templates to export a specific template')} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm">Go to Templates</button>
        </div>
      </div>
    </motion.div>
  )
}