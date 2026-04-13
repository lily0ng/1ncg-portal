'use client'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'
import Link from 'next/link'
import { Tag, ChevronRight } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function PricingManagementPage() {
  const { data } = useSWR('/api/pricing/plans', fetcher)
  const plans: any[] = Array.isArray(data) ? data : (data?.plans || [])
  const active = plans.find(p => p.active)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Pricing Management" description="Manage resource pricing plans" />
      {active && (
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4"><Tag className="w-5 h-5 text-indigo-400" /><h3 className="font-semibold text-white">Active Plan: {active.name}</h3></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[['VM Running/hr','$'+active.vmRunningHr?.toFixed(4)],['VM Alloc/hr','$'+active.vmAllocHr?.toFixed(4)],['Public IP/hr','$'+active.publicIpHr?.toFixed(4)],['Storage GB/mo','$'+active.storageGbMonth?.toFixed(4)],['Snapshot GB','$'+active.snapshotGb?.toFixed(4)],['LB Rule/hr','$'+active.lbRuleHr?.toFixed(4)]].map(([l,v]) => (
              <div key={l as string} className="bg-white/5 rounded-lg p-3"><div className="text-xs text-white/60">{l}</div><div className="text-lg font-bold text-white mt-0.5">{v}</div></div>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[{href:'/admin/pricing-management/plans',label:'Pricing Plans',desc:'View and manage all pricing tiers'},
          {href:'/admin/pricing-management/custom-pricing',label:'Custom Pricing',desc:'Account-specific pricing overrides'}].map(item => (
          <Link key={item.href} href={item.href} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors flex items-center justify-between">
            <div><div className="font-medium text-white">{item.label}</div><div className="text-sm text-white/60 mt-1">{item.desc}</div></div>
            <ChevronRight className="w-5 h-5 text-white/40" />
          </Link>
        ))}
      </div>
    </motion.div>
  )
}