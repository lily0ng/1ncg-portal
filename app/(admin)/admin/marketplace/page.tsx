'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'
import { Plus, Rocket, Database, Globe, Shield, Code, BarChart } from 'lucide-react'
import { toast } from 'sonner'
import useSWRMutation from 'swr/mutation'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const CATEGORY_ICONS: Record<string, any> = {
  Database, 'Web Server': Globe, 'Dev Tools': Code, Security: Shield, Monitoring: BarChart, Other: Rocket,
}

const CATEGORY_COLORS: Record<string, string> = {
  Database: 'bg-blue-500/20 text-blue-400', 'Web Server': 'bg-green-500/20 text-green-400',
  'Dev Tools': 'bg-purple-500/20 text-purple-400', Security: 'bg-red-500/20 text-red-400',
  Monitoring: 'bg-yellow-500/20 text-yellow-400', Other: 'bg-gray-500/20 text-gray-400',
}

export default function MarketplacePage() {
  const { data, mutate } = useSWR('/api/marketplace', fetcher)
  const { data: zones } = useSWR('/api/zones', fetcher)
  const { data: networks } = useSWR('/api/network/networks', fetcher)
  const apps: any[] = Array.isArray(data) ? data : (data?.apps || [])
  const zoneList: any[] = zones?.zones || []
  const netList: any[] = Array.isArray(networks) ? networks : (networks?.network || [])
  const [category, setCategory] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [deployApp, setDeployApp] = useState<any>(null)
  const [addForm, setAddForm] = useState({ name:'', description:'', category:'Other', templateId:'', offeringId:'', price:'0' })
  const [deployForm, setDeployForm] = useState({ zoneid:'', networkid:'', displayname:'' })
  const [deploying, setDeploying] = useState(false)

  const cats = ['All', ...Array.from(new Set(apps.map((a: any) => a.category)))]
  const filtered = category==='All' ? apps : apps.filter((a: any) => a.category===category)

  const handleDeploy = async () => {
    if (!deployApp) return
    if (!deployForm.zoneid) { toast.error('Select a zone'); return }
    setDeploying(true)
    try {
      const res = await fetch(`/api/marketplace/${deployApp.id}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({...deployForm, displayname: deployForm.displayname||deployApp.name}) })
      const r = await res.json()
      if (!res.ok) throw new Error(r.error)
      toast.success(`${deployApp.name} deployed successfully!`)
      setDeployApp(null)
    } catch (e: any) { toast.error(e.message || 'Deploy failed') }
    finally { setDeploying(false) }
  }

  const handleAddApp = async () => {
    try {
      const res = await fetch('/api/marketplace', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({...addForm, price: +addForm.price}) })
      if (!res.ok) throw new Error()
      toast.success('App added'); mutate(); setShowAdd(false)
    } catch { toast.error('Failed to add app') }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Marketplace" description="Deploy pre-configured applications" actions={
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"><Plus className="w-4 h-4" /> Add App</button>
      } />
      <div className="flex gap-2 flex-wrap">
        {cats.map(c => <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${category===c ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>{c}</button>)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((app: any) => {
          const Icon = CATEGORY_ICONS[app.category] || Rocket
          return (
            <div key={app.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2.5 rounded-lg ${CATEGORY_COLORS[app.category] || 'bg-gray-500/20 text-gray-400'}`}><Icon className="w-5 h-5" /></div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">{app.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[app.category] || 'bg-gray-500/20 text-gray-400'}`}>{app.category}</span>
                </div>
              </div>
              <p className="text-sm text-white/60 flex-1 line-clamp-2">{app.description}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-green-400 text-sm font-medium">{app.price > 0 ? `$${app.price}/hr` : 'Free'}</span>
                <button onClick={() => { setDeployApp(app); setDeployForm({zoneid:'',networkid:'',displayname:app.name}) }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5"><Rocket className="w-3.5 h-3.5" /> Deploy</button>
              </div>
            </div>
          )
        })}
        {filtered.length===0 && <div className="col-span-3 text-center py-12 text-white/40">No apps found</div>}
      </div>
      {deployApp && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-white">Deploy {deployApp.name}</h3>
            <div><label className="text-sm text-white/60 block mb-1">Instance Name</label><input value={deployForm.displayname} onChange={e => setDeployForm(f => ({...f, displayname: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" /></div>
            <div><label className="text-sm text-white/60 block mb-1">Zone</label>
              <select value={deployForm.zoneid} onChange={e => setDeployForm(f => ({...f, zoneid: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                <option value="">Select Zone</option>{zoneList.map((z: any) => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select></div>
            <div><label className="text-sm text-white/60 block mb-1">Network</label>
              <select value={deployForm.networkid} onChange={e => setDeployForm(f => ({...f, networkid: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                <option value="">Select Network</option>{netList.map((n: any) => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select></div>
            <div className="flex gap-3">
              <button onClick={handleDeploy} disabled={deploying} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm">{deploying ? 'Deploying...' : 'Deploy'}</button>
              <button onClick={() => setDeployApp(null)} className="flex-1 bg-white/10 text-white py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-white">Add App to Marketplace</h3>
            {[['Name','name','text'],['Description','description','text'],['Template ID','templateId','text'],['Offering ID','offeringId','text'],['Price ($/hr)','price','number']].map(([l,k,t]) => (
              <div key={k}><label className="text-sm text-white/60 block mb-1">{l}</label><input type={t} value={(addForm as any)[k]} onChange={e => setAddForm(f => ({...f,[k]:e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" /></div>
            ))}
            <div><label className="text-sm text-white/60 block mb-1">Category</label>
              <select value={addForm.category} onChange={e => setAddForm(f => ({...f, category: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                {['Database','Web Server','Dev Tools','Security','Monitoring','Other'].map(c => <option key={c}>{c}</option>)}
              </select></div>
            <div className="flex gap-3">
              <button onClick={handleAddApp} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm">Add App</button>
              <button onClick={() => setShowAdd(false)} className="flex-1 bg-white/10 text-white py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}