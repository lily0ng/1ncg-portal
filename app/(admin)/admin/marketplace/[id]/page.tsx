'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { Rocket, Package } from 'lucide-react'
import { toast } from 'sonner'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function MarketplaceAppDetailPage() {
  const { id } = useParams() as { id: string }
  const { data: app } = useSWR(`/api/marketplace/${id}`, fetcher)
  const { data: zones } = useSWR('/api/zones', fetcher)
  const { data: networks } = useSWR('/api/network/networks', fetcher)
  const zoneList: any[] = zones?.zones || []
  const netList: any[] = Array.isArray(networks) ? networks : (networks?.network || [])
  const [form, setForm] = useState({ zoneid:'', networkid:'', displayname:'' })
  const [deploying, setDeploying] = useState(false)

  const handleDeploy = async () => {
    if (!form.zoneid) { toast.error('Select a zone'); return }
    setDeploying(true)
    try {
      const res = await fetch(`/api/marketplace/${id}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({...form, displayname: form.displayname||app?.name}) })
      const r = await res.json()
      if (!res.ok) throw new Error(r.error)
      toast.success(`${app?.name} deployed successfully!`)
    } catch (e: any) { toast.error(e.message||'Deploy failed') }
    finally { setDeploying(false) }
  }

  if (!app) return <div className="animate-pulse h-40 bg-white/5 rounded-xl m-6" />

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title={app.name} description={app.category} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="font-medium text-white mb-2">Description</h3>
            <p className="text-white/70 text-sm">{app.description}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="font-medium text-white mb-4">Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[['Category',app.category],['Price',app.price>0?`$${app.price}/hr`:'Free'],['Template ID',app.templateId||'-'],['Offering ID',app.offeringId||'-']].map(([l,v]) => (
                <div key={l as string}><div className="text-white/50 text-xs">{l}</div><div className="text-white">{v as string}</div></div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-fit space-y-4">
          <h3 className="font-medium text-white flex items-center gap-2"><Package className="w-4 h-4 text-indigo-400" /> Deploy</h3>
          <div><label className="text-xs text-white/60 block mb-1">Instance Name</label><input value={form.displayname} placeholder={app.name} onChange={e => setForm(f=>({...f,displayname:e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" /></div>
          <div><label className="text-xs text-white/60 block mb-1">Zone *</label>
            <select value={form.zoneid} onChange={e => setForm(f=>({...f,zoneid:e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
              <option value="">Select Zone</option>{zoneList.map((z:any) => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select></div>
          <div><label className="text-xs text-white/60 block mb-1">Network</label>
            <select value={form.networkid} onChange={e => setForm(f=>({...f,networkid:e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
              <option value="">Select Network</option>{netList.map((n:any) => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select></div>
          <button onClick={handleDeploy} disabled={deploying} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
            <Rocket className="w-4 h-4" />{deploying ? 'Deploying...' : 'Deploy Now'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}