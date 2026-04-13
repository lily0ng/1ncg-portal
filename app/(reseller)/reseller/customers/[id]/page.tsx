'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import * as Tabs from '@radix-ui/react-tabs'
import {
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  User,
  Server,
  HardDrive,
  DollarSign,
} from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then(r => r.json())

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-slate-800 last:border-0">
      <span className="text-sm text-slate-400 w-40 shrink-0">{label}</span>
      <span className="text-sm text-white text-right flex-1">{value ?? '—'}</span>
    </div>
  )
}

function SkeletonRows() {
  return (
    <div className="p-4 space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse bg-white/10 h-10 rounded" />
      ))}
    </div>
  )
}

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = (params?.id ?? '') as string
  const [activeTab, setActiveTab] = useState('overview')

  const { data: accountData, error: accountError, isLoading: accountLoading, mutate: mutateAccount } =
    useSWR(`/api/accounts/${id}`, fetcher)

  const { data: vmsData, isLoading: vmsLoading } =
    useSWR(`/api/compute/vms?account=${accountData?.account?.name}`, fetcher, {
      isPaused: () => !accountData?.account?.name,
    })

  const { data: volumesData, isLoading: volumesLoading } =
    useSWR(`/api/storage/volumes?account=${accountData?.account?.name}`, fetcher, {
      isPaused: () => !accountData?.account?.name,
    })

  const { data: billingData, isLoading: billingLoading } =
    useSWR(`/api/billing/usage?account=${accountData?.account?.name}`, fetcher, {
      isPaused: () => !accountData?.account?.name,
    })

  const account = accountData?.account
  const vms = vmsData?.vms ?? []
  const volumes = volumesData?.volumes ?? []
  const usageRecords = billingData?.usageRecords ?? []

  if (accountError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-slate-400">Failed to load customer details</p>
        <button
          onClick={() => mutateAccount()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    )
  }

  const tabs = [
    { value: 'overview', label: 'Overview', icon: User },
    { value: 'instances', label: 'Instances', icon: Server },
    { value: 'volumes', label: 'Volumes', icon: HardDrive },
    { value: 'billing', label: 'Billing', icon: DollarSign },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Back + Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Customers
        </button>
        <div className="flex items-center gap-3">
          {accountLoading ? (
            <div className="animate-pulse bg-white/10 h-8 w-48 rounded" />
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white">{account?.name ?? id}</h1>
              {account?.state && <StatusBadge status={account.state.toLowerCase()} />}
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex gap-1 bg-slate-900/50 border border-slate-800 rounded-xl p-1 w-full overflow-x-auto">
          {tabs.map(tab => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className={cn(
                'flex-1 min-w-[110px] flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all whitespace-nowrap',
                activeTab === tab.value
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* Overview */}
        <Tabs.Content value="overview" className="mt-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            {accountLoading ? <SkeletonRows /> : account ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                <div>
                  <InfoRow label="Account ID" value={<span className="font-mono text-xs">{account.id}</span>} />
                  <InfoRow label="Name" value={account.name} />
                  <InfoRow label="Email" value={account.email} />
                  <InfoRow label="State" value={<StatusBadge status={(account.state ?? 'unknown').toLowerCase()} />} />
                </div>
                <div>
                  <InfoRow label="Domain" value={account.domain} />
                  <InfoRow label="Account Type" value={account.accounttype} />
                  <InfoRow label="VM Count" value={account.vmcount} />
                  <InfoRow label="Volume Count" value={account.volumecount} />
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">No data available</p>
            )}
          </div>
        </Tabs.Content>

        {/* Instances */}
        <Tabs.Content value="instances" className="mt-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h3 className="text-white font-semibold">Virtual Machines</h3>
            </div>
            {vmsLoading ? <SkeletonRows /> : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    {['Name', 'State', 'IP', 'CPU', 'RAM', 'Zone', 'Created'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vms.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No instances found</td></tr>
                  ) : vms.map((vm: any) => (
                    <tr key={vm.id} className="border-b border-slate-800/50 last:border-0">
                      <td className="px-4 py-3 text-sm font-medium text-white">{vm.displayname || vm.name}</td>
                      <td className="px-4 py-3"><StatusBadge status={(vm.state ?? 'unknown').toLowerCase()} /></td>
                      <td className="px-4 py-3 text-sm text-slate-300">{vm.ipaddress ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{vm.cpunumber ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{vm.memory ? `${vm.memory} MB` : '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{vm.zonename ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{vm.created ? new Date(vm.created).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Tabs.Content>

        {/* Volumes */}
        <Tabs.Content value="volumes" className="mt-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h3 className="text-white font-semibold">Volumes</h3>
            </div>
            {volumesLoading ? <SkeletonRows /> : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    {['Name', 'Type', 'Size', 'State', 'Zone', 'Created'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {volumes.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No volumes found</td></tr>
                  ) : volumes.map((vol: any) => (
                    <tr key={vol.id} className="border-b border-slate-800/50 last:border-0">
                      <td className="px-4 py-3 text-sm font-medium text-white">{vol.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{vol.type}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{vol.size ? `${Math.round(vol.size / (1024 ** 3))} GB` : '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={(vol.state ?? 'unknown').toLowerCase()} /></td>
                      <td className="px-4 py-3 text-sm text-slate-300">{vol.zonename ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{vol.created ? new Date(vol.created).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Tabs.Content>

        {/* Billing */}
        <Tabs.Content value="billing" className="mt-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h3 className="text-white font-semibold">Usage & Billing</h3>
            </div>
            {billingLoading ? <SkeletonRows /> : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    {['Resource', 'Type', 'Usage', 'Cost'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usageRecords.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No billing data found</td></tr>
                  ) : usageRecords.map((rec: any, i: number) => (
                    <tr key={i} className="border-b border-slate-800/50 last:border-0">
                      <td className="px-4 py-3 text-sm font-medium text-white">{rec.name ?? rec.virtualmachinename ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{rec.usagetype ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{rec.rawusage ? `${parseFloat(rec.rawusage).toFixed(2)} hrs` : '—'}</td>
                      <td className="px-4 py-3 text-sm text-green-400">${(rec.cost ?? 0).toFixed(4)}</td>
                    </tr>
                  ))}
                  {usageRecords.length > 0 && (
                    <tr className="bg-slate-800/30">
                      <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-white text-right">Total</td>
                      <td className="px-4 py-3 text-sm font-bold text-green-400">
                        ${usageRecords.reduce((s: number, r: any) => s + (r.cost ?? 0), 0).toFixed(2)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </motion.div>
  )
}
