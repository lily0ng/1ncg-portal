'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function CreditsPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/billing/credits', fetcher)
  const { data: accounts } = useSWR('/api/accounts', fetcher)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ userId: '', amount: '', reason: '' })
  const credits = Array.isArray(data) ? data : (data?.users || [])
  const accts = Array.isArray(accounts) ? accounts : (accounts?.account || [])

  const handleAdd = async () => {
    if (!form.userId || !form.amount) { toast.error('Account and amount required'); return }
    try {
      const res = await fetch('/api/billing/credits', { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({...form, amount: parseFloat(form.amount)}) })
      if (!res.ok) throw new Error('Failed')
      toast.success('Credits added'); mutate(); setShowAdd(false); setForm({userId:'',amount:'',reason:''})
    } catch { toast.error('Failed to add credits') }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Account Credits" description="Manage account credit balances" actions={
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"><Plus className="w-4 h-4" /> Add Credits</button>
      } />
      {isLoading && <div className="animate-pulse h-40 bg-white/5 rounded-xl" />}
      {error && <div className="text-red-400 p-4 bg-red-400/10 rounded-xl">Failed. <button onClick={() => mutate()} className="underline">Retry</button></div>}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10 text-white/60">
            {['Account','Email','Balance (USD)'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
          </tr></thead>
          <tbody>
            {credits.map((u: any) => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 text-white">{u.username}</td>
                <td className="px-4 py-3 text-white/70">{u.email}</td>
                <td className="px-4 py-3 text-green-400">${(u.balance||0).toFixed(2)}</td>
              </tr>
            ))}
            {credits.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-white/40">No accounts</td></tr>}
          </tbody>
        </table>
      </div>
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-white">Add Credits</h3>
            <div><label className="text-sm text-white/60 block mb-1">Account</label>
              <select value={form.userId} onChange={e => setForm(f => ({...f, userId: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                <option value="">Select Account</option>
                {accts.map((a: any) => <option key={a.id} value={a.id}>{a.name || a.username}</option>)}
              </select></div>
            <div><label className="text-sm text-white/60 block mb-1">Amount (USD)</label>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" /></div>
            <div><label className="text-sm text-white/60 block mb-1">Reason</label>
              <textarea value={form.reason} onChange={e => setForm(f => ({...f, reason: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm h-20" /></div>
            <div className="flex gap-3">
              <button onClick={handleAdd} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm">Add Credits</button>
              <button onClick={() => setShowAdd(false)} className="flex-1 bg-white/10 text-white py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}