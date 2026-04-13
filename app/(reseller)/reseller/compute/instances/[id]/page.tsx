'use client'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { toast } from 'sonner'
import { useState } from 'react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ResellerInstanceDetailPage() {
  const { id } = useParams() as { id: string }
  const [tab, setTab] = useState('overview')
  const { data, mutate } = useSWR('/api/compute/vms', fetcher)
  const { data: events } = useSWR(tab==='events' ? `/api/events?resourceid=${id}` : null, fetcher)
  const vms: any[] = Array.isArray(data) ? data : (data?.virtualmachine || [])
  const vm = vms.find(v => v.id===id) || {}

  const action = async (act: string) => {
    try { await fetch(`/api/compute/vms/${id}/${act}`, { method:'POST' }); toast.success(`${act} initiated`); mutate() }
    catch { toast.error(`Failed`) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title={vm.displayname||vm.name||id} actions={
        <div className="flex gap-2">
          {vm.state==='Stopped'&&<button onClick={()=>action('start')} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm">Start</button>}
          {vm.state==='Running'&&<button onClick={()=>action('stop')} className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-lg text-sm">Stop</button>}
          {vm.state==='Running'&&<button onClick={()=>action('reboot')} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm">Reboot</button>}
        </div>
      } />
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit">
        {['overview','events'].map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${tab===t?'bg-indigo-600 text-white':'text-white/60 hover:text-white'}`}>{t}</button>)}
      </div>
      {tab==='overview' && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 grid grid-cols-2 gap-4">
          {[['ID',vm.id],['State',''],['Zone',vm.zonename],['Host',vm.hostname],['IP',vm.nic?.[0]?.ipaddress],['vCPUs',vm.cpunumber],['RAM',vm.memory ? vm.memory/1024+'GB' : '-'],['Account',vm.account],['Created',vm.created ? new Date(vm.created).toLocaleDateString() : '-']].map(([l,v]) => (
            <div key={l as string}><div className="text-xs text-white/60">{l}</div>
              {l==='State' ? <StatusBadge status={vm.state} /> : <div className="text-white mt-0.5 text-sm">{v as string||'-'}</div>}
            </div>
          ))}
        </div>
      )}
      {tab==='events' && (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/10 text-white/60">{['Type','Description','Account','Created'].map(h=><th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr></thead>
            <tbody>{(Array.isArray(events)?events:(events?.event||[])).map((e:any,i:number)=>(
              <tr key={i} className="border-b border-white/5"><td className="px-4 py-2 text-white/70 text-xs">{e.type}</td><td className="px-4 py-2 text-white/70 text-xs">{e.description}</td><td className="px-4 py-2 text-white/60 text-xs">{e.account}</td><td className="px-4 py-2 text-white/60 text-xs">{e.created ? new Date(e.created).toLocaleDateString() : '-'}</td></tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </motion.div>
  )
}