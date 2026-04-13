'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Domain {
  id: string
  name: string
  path?: string
  level?: number
  parentdomainid?: string
  parentdomainname?: string
  state?: string
  networkdomain?: string
  created?: string
}

interface Account {
  id: string
  name?: string
  username?: string
  email?: string
  state?: string
  domainid?: string
}

export default function DomainDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [activeTab, setActiveTab] = useState('overview')

  const { data: domainsData, error, isLoading } = useSWR('/api/domains', fetcher)
  const { data: accountsData } = useSWR(activeTab === 'accounts' ? '/api/accounts' : null, fetcher)

  const domains: Domain[] = domainsData?.domains || []
  const domain = domains.find(d => d.id === id)

  const accounts: Account[] = (accountsData?.accounts || []).filter(
    (a: Account) => a.domainid === id
  )

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white/10 rounded w-48" />
        <div className="h-48 bg-white/5 rounded-xl" />
      </div>
    )
  }

  if (error || !domain) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-center">
        <p className="text-red-400">Domain not found</p>
        <button onClick={() => router.back()} className="mt-3 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors">Go Back</button>
      </div>
    )
  }

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
          title={domain.name}
          description={domain.path}
          action={<StatusBadge status={domain.state || 'active'} />}
        />
      </div>

      <div className="flex gap-1 p-1 bg-white/5 rounded-xl w-fit">
        {['overview', 'accounts', 'settings'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${activeTab === tab ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}>{tab}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-white font-semibold mb-4">Domain Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'ID', value: domain.id },
              { label: 'Name', value: domain.name },
              { label: 'Path', value: domain.path || '-' },
              { label: 'Level', value: domain.level ?? '-' },
              { label: 'Parent Domain', value: domain.parentdomainname || 'Root' },
              { label: 'State', value: <StatusBadge status={domain.state || 'active'} /> },
              { label: 'Network Domain', value: domain.networkdomain || '-' },
              { label: 'Created', value: domain.created ? new Date(domain.created).toLocaleString() : '-' },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 bg-white/5 rounded-lg">
                <p className="text-white/40 text-xs mb-1">{label}</p>
                <div className="text-white text-sm font-medium">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'accounts' && (
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-white/60 text-sm font-medium">Username</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Email</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">State</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 ? (
                <tr><td colSpan={3} className="p-8 text-center text-white/40">No accounts in this domain</td></tr>
              ) : accounts.map(a => (
                <tr key={a.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white font-medium">{a.name || a.username}</td>
                  <td className="p-4 text-white/60 text-sm">{a.email || '-'}</td>
                  <td className="p-4"><StatusBadge status={a.state || 'enabled'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-white font-semibold mb-4">Domain Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-white/40 text-xs mb-1">Network Domain</p>
              <p className="text-white text-sm font-medium">{domain.networkdomain || 'Not configured'}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-white/40 text-xs mb-1">DNS Suffix</p>
              <p className="text-white text-sm font-medium">{domain.networkdomain ? `cs.${domain.networkdomain}` : 'Not configured'}</p>
            </div>
          </div>
          <p className="text-white/40 text-sm mt-6">Additional domain settings can be configured via the CloudStack API or management console.</p>
        </div>
      )}
    </motion.div>
  )
}
