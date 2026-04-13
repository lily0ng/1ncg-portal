'use client'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'
import { Info } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function CustomPricingPage() {
  const { data } = useSWR('/api/pricing/custom', fetcher)
  const plans: any[] = Array.isArray(data) ? data : (data?.plans || [])
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Custom Pricing" description="Account-specific pricing overrides" />
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-300">Custom pricing plans override default rates for specific accounts or resellers. Create a custom plan with a unique name to apply it to specific accounts.</p>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10 text-white/60">
            {['Plan Name','VM/hr','IP/hr','Storage/GB-mo','Created'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
          </tr></thead>
          <tbody>
            {plans.map((p: any) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 text-white">{p.name}</td>
                <td className="px-4 py-3 text-white/70">${p.vmRunningHr}</td>
                <td className="px-4 py-3 text-white/70">${p.publicIpHr}</td>
                <td className="px-4 py-3 text-white/70">${p.storageGbMonth}</td>
                <td className="px-4 py-3 text-white/60">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
            {plans.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-white/40">No custom plans</td></tr>}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}