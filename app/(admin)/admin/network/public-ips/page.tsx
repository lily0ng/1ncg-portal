'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function PublicIPsPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/network/public-ips', fetcher)
  const { data: zones } = useSWR('/api/zones', fetcher)
  const [showAllocate, setShowAllocate] = useState(false)
  const [zoneid, setZoneid] = useState('')
  const ips: any[] = Array.isArray(data) ? data : (data?.publicipaddress || [])
  const zoneList: any[] = zones?.zones || []

  const handleAllocate = async () => {
    if (!zoneid) { toast.error('Select a zone'); return }
    try {
      const res = await fetch('/api/network/public-ips', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({zoneid}) })
      if (!res.ok) throw new Error()
      toast.success('IP allocated'); mutate(); setShowAllocate(false)
    } catch { toast.error('Failed to allocate IP') }
  }

  const handleRelease = async (id: string) => {
    if (!confirm('Release this IP address?')) return
    try { await fetch(`/api/network/public-ips/${id}`, { method:'DELETE' }); toast.success('IP released'); mutate() }
    catch { toast.error('Failed') }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Public IP Addresses" description="Manage allocated public IPs" actions={
        <button onClick={() => setShowAllocate(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"><Plus className="w-4 h-4" /> Allocate IP</button>
      } />
      {isLoading && <div className="animate-pulse h-40 bg-white/5 rounded-xl" />}
      {error && <div className="text-red-400 p-4 bg-red-400/10 rounded-xl">Failed. <button onClick={() => mutate()} className="underline">Retry</button></div>}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10 text-white/60">
            {['IP Address','State','Zone','VM (Static NAT)','Purpose','Created','Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
          </tr></thead>
          <tbody>
            {ips.map((ip: any) => (
              <tr key={ip.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 text-white font-mono">{ip.ipaddress}</td>
                <td className="px-4 py-3"><StatusBadge status={ip.state} /></td>
                <td className="px-4 py-3 text-white/70">{ip.zonename}</td>
                <td className="px-4 py-3 text-white/70">{ip.virtualmachinename||'-'}</td>
                <td className="px-4 py-3 text-white/70">{ip.purpose||ip.issourcenat?'SourceNAT':'-'}</td>
                <td className="px-4 py-3 text-white/60">{ip.allocated ? new Date(ip.allocated).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3"><button onClick={() => handleRelease(ip.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
            {ips.length===0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-white/40">No IPs allocated</td></tr>}
          </tbody>
        </table>
      </div>
      {showAllocate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-semibold text-white">Allocate IP</h3>
            <div><label className="text-sm text-white/60 block mb-1">Zone</label>
              <select value={zoneid} onChange={e => setZoneid(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                <option value="">Select Zone</option>{zoneList.map((z:any) => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select></div>
            <div className="flex gap-3">
              <button onClick={handleAllocate} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm">Allocate</button>
              <button onClick={() => setShowAllocate(false)} className="flex-1 bg-white/10 text-white py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}