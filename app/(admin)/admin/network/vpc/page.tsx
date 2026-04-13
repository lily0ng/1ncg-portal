'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { Plus, Trash2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function VPCPage() {
  const { data, error, isLoading, mutate } = useSWR('/api/network/vpc', fetcher)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', displaytext: '', cidr: '', zoneid: '', vpcofferingid: '' })
  const { data: zones } = useSWR('/api/zones', fetcher)

  const vpcs = data?.vpcs || []

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/network/vpc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error('Failed')
      toast.success('VPC created')
      mutate(); setShowCreate(false)
    } catch { toast.error('Failed to create VPC') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this VPC?')) return
    try {
      await fetch(`/api/network/vpc/${id}`, { method: 'DELETE' })
      toast.success('VPC deleted'); mutate()
    } catch { toast.error('Failed to delete VPC') }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="VPC" description="Virtual Private Clouds" actions={
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm">
          <Plus className="w-4 h-4" /> Create VPC
        </button>
      } />
      {isLoading && <div className="animate-pulse h-40 bg-white/5 rounded-xl" />}
      {error && <div className="text-red-400 p-4 bg-red-400/10 rounded-xl">Failed to load VPCs</div>}
      {!isLoading && (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/10 text-white/60">
              {['Name','State','CIDR','Zone','Redundant','Created','Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
            </tr></thead>
            <tbody>
              {vpcs.map((v: any) => (
                <tr key={v.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3"><Link href={`/admin/network/vpc/${v.id}`} className="text-indigo-400 hover:underline">{v.name}</Link></td>
                  <td className="px-4 py-3"><StatusBadge status={v.state} /></td>
                  <td className="px-4 py-3 text-white/70">{v.cidr}</td>
                  <td className="px-4 py-3 text-white/70">{v.zonename}</td>
                  <td className="px-4 py-3 text-white/70">{v.redundantvpcrouter ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-white/60">{v.created ? new Date(v.created).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3"><button onClick={() => handleDelete(v.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
              {vpcs.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-white/40">No VPCs found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-white">Create VPC</h3>
            {[['Name','name','text'],['Display Text','displaytext','text'],['CIDR','cidr','text'],['VPC Offering ID','vpcofferingid','text']].map(([label,key,type]) => (
              <div key={key}><label className="text-sm text-white/60 block mb-1">{label}</label>
              <input type={type} value={(form as any)[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" /></div>
            ))}
            <div><label className="text-sm text-white/60 block mb-1">Zone</label>
              <select value={form.zoneid} onChange={e => setForm(f => ({...f, zoneid: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                <option value="">Select Zone</option>
                {(zones?.zones || []).map((z: any) => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select></div>
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
