'use client'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { toast } from 'sonner'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ResellerInstancesPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/compute/vms', fetcher)
  const vms: any[] = Array.isArray(data) ? data : (data?.virtualmachine || [])

  const action = async (id: string, act: string) => {
    try {
      await fetch(`/api/compute/vms/${id}/${act}`, { method:'POST' })
      toast.success(`VM ${act} initiated`); mutate()
    } catch { toast.error(`Failed to ${act} VM`) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Customer Instances" description="All VMs across customer accounts" />
      {isLoading && <div className="animate-pulse h-40 bg-white/5 rounded-xl" />}
      {error && <div className="text-red-400 p-4 bg-red-400/10 rounded-xl">Failed. <button onClick={() => mutate()} className="underline">Retry</button></div>}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10 text-white/60">
            {['Name','Status','Account','IP','vCPUs','RAM','Zone','Actions'].map(h=><th key={h} className="px-4 py-3 text-left">{h}</th>)}
          </tr></thead>
          <tbody>
            {vms.map((vm: any) => (
              <tr key={vm.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3"><Link href={`/reseller/compute/instances/${vm.id}`} className="text-indigo-400 hover:underline">{vm.displayname||vm.name}</Link></td>
                <td className="px-4 py-3"><StatusBadge status={vm.state} /></td>
                <td className="px-4 py-3 text-white/70">{vm.account}</td>
                <td className="px-4 py-3 text-white/70 font-mono text-xs">{vm.nic?.[0]?.ipaddress||'-'}</td>
                <td className="px-4 py-3 text-white/70">{vm.cpunumber}</td>
                <td className="px-4 py-3 text-white/70">{vm.memory ? (vm.memory/1024).toFixed(1)+'GB' : '-'}</td>
                <td className="px-4 py-3 text-white/70">{vm.zonename}</td>
                <td className="px-4 py-3 flex gap-1">
                  {vm.state==='Stopped' && <button onClick={()=>action(vm.id,'start')} className="text-xs text-green-400 hover:text-green-300 px-2 py-1 bg-green-400/10 rounded">Start</button>}
                  {vm.state==='Running' && <button onClick={()=>action(vm.id,'stop')} className="text-xs text-yellow-400 hover:text-yellow-300 px-2 py-1 bg-yellow-400/10 rounded">Stop</button>}
                </td>
              </tr>
            ))}
            {vms.length===0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-white/40">No instances</td></tr>}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}