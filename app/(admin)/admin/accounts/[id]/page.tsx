'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { ArrowLeft, Server, HardDrive, DollarSign, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Account {
  id: string
  name?: string
  username?: string
  email?: string
  accounttype?: number
  domain?: string
  domainid?: string
  state?: string
  vmcount?: number
  created?: string
  firstname?: string
  lastname?: string
  vmlimit?: string
  volumelimit?: string
  networklimit?: string
}

const ACCOUNT_TYPE_LABELS: Record<number, { label: string; style: string }> = {
  0: { label: 'User', style: 'bg-blue-500/20 text-blue-400' },
  1: { label: 'Admin', style: 'bg-red-500/20 text-red-400' },
  2: { label: 'DomainAdmin', style: 'bg-orange-500/20 text-orange-400' },
  4: { label: 'ResourceAdmin', style: 'bg-green-500/20 text-green-400' },
}

export default function AccountDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [activeTab, setActiveTab] = useState('overview')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data: accountsData, error, isLoading, mutate } = useSWR('/api/accounts', fetcher)
  const { data: vmsData } = useSWR(activeTab === 'resources' ? '/api/compute/vms' : null, fetcher)
  const { data: volumesData } = useSWR(activeTab === 'resources' ? '/api/storage/volumes' : null, fetcher)
  const { data: billingData } = useSWR(
    activeTab === 'billing' ? `/api/billing/usage?account=${id}` : null, fetcher
  )

  const accounts: Account[] = accountsData?.accounts || []
  const account = accounts.find(a => a.id === id)
  const accountName = account?.name || account?.username || ''

  const vms = (vmsData?.vms || vmsData?.virtualmachine || []).filter(
    (v: { account?: string }) => v.account === accountName
  )
  const volumes = (volumesData?.volumes || []).filter(
    (v: { account?: string }) => v.account === accountName
  )

  const toggleState = async () => {
    if (!account) return
    const action = account.state === 'enabled' ? 'disable' : 'enable'
    try {
      await fetch(`/api/accounts?id=${account.id}&action=${action}`, { method: 'POST' })
      toast.success(`Account ${action}d`)
      mutate()
    } catch {
      toast.error(`Failed to ${action} account`)
    }
  }

  const handleDelete = async () => {
    if (!account) return
    try {
      await fetch(`/api/accounts?id=${account.id}`, { method: 'DELETE' })
      toast.success('Account deleted')
      router.push('/admin/accounts')
    } catch {
      toast.error('Failed to delete account')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white/10 rounded w-48" />
        <div className="h-64 bg-white/5 rounded-xl" />
      </div>
    )
  }

  if (error || !account) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-center">
        <p className="text-red-400">Account not found</p>
        <button onClick={() => router.back()} className="mt-3 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors">Go Back</button>
      </div>
    )
  }

  const typeInfo = ACCOUNT_TYPE_LABELS[account.accounttype ?? 0] || ACCOUNT_TYPE_LABELS[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 bg-white/5 hover:bg-white/10 text-white/60 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <PageHeader
          title={account.name || account.username || 'Account'}
          action={
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${typeInfo.style}`}>{typeInfo.label}</span>
              <StatusBadge status={account.state || 'enabled'} />
            </div>
          }
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={toggleState} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${account.state === 'enabled' ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}>
          {account.state === 'enabled' ? 'Disable Account' : 'Enable Account'}
        </button>
        <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-2">
          <Trash2 className="w-4 h-4" />Delete Account
        </button>
      </div>

      <div className="flex gap-1 p-1 bg-white/5 rounded-xl w-fit">
        {['overview', 'resources', 'billing'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${activeTab === tab ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}>{tab}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-white font-semibold mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'ID', value: account.id },
              { label: 'Username', value: account.name || account.username },
              { label: 'Email', value: account.email || '-' },
              { label: 'Type', value: <span className={`text-xs px-2 py-1 rounded-full ${typeInfo.style}`}>{typeInfo.label}</span> },
              { label: 'Domain', value: account.domain || '-' },
              { label: 'State', value: <StatusBadge status={account.state || 'enabled'} /> },
              { label: 'VM Limit', value: account.vmlimit || 'Unlimited' },
              { label: 'Volume Limit', value: account.volumelimit || 'Unlimited' },
              { label: 'Network Limit', value: account.networklimit || 'Unlimited' },
              { label: 'Created', value: account.created ? new Date(account.created).toLocaleString() : '-' },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 bg-white/5 rounded-lg">
                <p className="text-white/40 text-xs mb-1">{label}</p>
                <div className="text-white text-sm font-medium">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Server className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-semibold">Virtual Machines</h3>
              <span className="ml-auto text-2xl font-bold text-white">{vms.length}</span>
            </div>
            {vms.slice(0, 5).map((vm: { id: string; name: string; displayname?: string; state?: string }) => (
              <div key={vm.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-white/80 text-sm">{vm.displayname || vm.name}</span>
                <StatusBadge status={vm.state || 'unknown'} />
              </div>
            ))}
            {vms.length === 0 && <p className="text-white/40 text-sm text-center py-4">No VMs found</p>}
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <HardDrive className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-semibold">Volumes</h3>
              <span className="ml-auto text-2xl font-bold text-white">{volumes.length}</span>
            </div>
            {volumes.slice(0, 5).map((vol: { id: string; name: string; size?: number }) => (
              <div key={vol.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-white/80 text-sm">{vol.name}</span>
                <span className="text-white/40 text-xs">{vol.size ? `${Math.round(vol.size / 1073741824)} GB` : '-'}</span>
              </div>
            ))}
            {volumes.length === 0 && <p className="text-white/40 text-sm text-center py-4">No volumes found</p>}
          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="w-5 h-5 text-green-400" />
              <h3 className="text-white font-semibold">Billing — Current Month</h3>
            </div>
            {!billingData ? (
              <div className="animate-pulse space-y-3">
                <div className="h-8 bg-white/10 rounded w-32" />
                <div className="h-4 bg-white/10 rounded w-full" />
                <div className="h-4 bg-white/10 rounded w-3/4" />
              </div>
            ) : (
              <>
                <div className="text-4xl font-bold text-white mb-6">
                  ${(billingData?.total ?? 0).toFixed(2)}
                  <span className="text-lg text-white/40 font-normal ml-2">this month</span>
                </div>
                {billingData?.breakdown && Object.entries(billingData.breakdown).map(([type, cost]) => (
                  <div key={type} className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-white/60 text-sm capitalize">{type}</span>
                    <span className="text-white text-sm font-medium">${Number(cost).toFixed(2)}</span>
                  </div>
                ))}
                {(!billingData?.breakdown || Object.keys(billingData.breakdown).length === 0) && (
                  <p className="text-white/40 text-sm text-center py-4">No billing data available for this period</p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-white mb-2">Delete Account</h2>
            <p className="text-white/60 mb-6">Delete <span className="text-white font-medium">{account.name || account.username}</span>? This cannot be undone and all associated resources will be released.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors">Cancel</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
