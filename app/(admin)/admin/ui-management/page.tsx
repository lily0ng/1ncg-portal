'use client'
import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'
import { toast } from 'sonner'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const THEMES = [
  { id:'dark-nebula', name:'Dark Nebula', bg:'#0a0a0f', accent:'#6366f1' },
  { id:'ocean-breeze', name:'Ocean Breeze', bg:'#0f1f2e', accent:'#06b6d4' },
  { id:'forest-night', name:'Forest Night', bg:'#0d1f0d', accent:'#22c55e' },
  { id:'sunset-pro', name:'Sunset Pro', bg:'#1a0f0f', accent:'#f97316' },
  { id:'arctic-light', name:'Arctic Light', bg:'#f8fafc', accent:'#3b82f6' },
  { id:'rose-gold', name:'Rose Gold', bg:'#1a0f14', accent:'#ec4899' },
  { id:'monochrome', name:'Monochrome', bg:'#000000', accent:'#ffffff' },
]

export default function UIManagementPage() {
  const { data, mutate } = useSWR('/api/ui-settings', fetcher)
  const [form, setForm] = useState({ portalName: '1CNG Cloud Portal', logoUrl: '', primaryColor: '#6366f1', theme: 'dark-nebula' })
  const [selectedTheme, setSelectedTheme] = useState('dark-nebula')

  useEffect(() => { if (data) { setForm(f => ({...f, ...data})); setSelectedTheme(data.theme||'dark-nebula') } }, [data])

  const handleSave = async () => {
    try {
      const res = await fetch('/api/ui-settings', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({...form, theme: selectedTheme}) })
      if (!res.ok) throw new Error()
      toast.success('Settings saved'); mutate()
      document.documentElement.className = selectedTheme
    } catch { toast.error('Failed to save') }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="UI Management" description="Customize portal branding and theme" />
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-white">Portal Branding</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm text-white/60 block mb-1">Portal Name</label>
            <input value={form.portalName} onChange={e => setForm(f => ({...f, portalName: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" /></div>
          <div><label className="text-sm text-white/60 block mb-1">Logo URL</label>
            <input value={form.logoUrl} onChange={e => setForm(f => ({...f, logoUrl: e.target.value}))} placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" /></div>
        </div>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-white">Theme Selection</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {THEMES.map(t => (
            <button key={t.id} onClick={() => setSelectedTheme(t.id)} className={`p-3 rounded-xl border-2 transition-all ${selectedTheme===t.id ? 'border-indigo-500' : 'border-white/10'}`}>
              <div className="h-12 rounded-lg mb-2 overflow-hidden flex">
                <div className="flex-1" style={{background: t.bg}} />
                <div className="w-4" style={{background: t.accent}} />
              </div>
              <div className="text-xs text-white text-center">{t.name}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-white">Primary Color</h3>
        <div className="flex items-center gap-4">
          <input type="color" value={form.primaryColor} onChange={e => setForm(f => ({...f, primaryColor: e.target.value}))} className="w-12 h-12 rounded-lg cursor-pointer border border-white/10" />
          <span className="text-white/70 font-mono text-sm">{form.primaryColor}</span>
        </div>
      </div>
      <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium">Save All Changes</button>
    </motion.div>
  )
}