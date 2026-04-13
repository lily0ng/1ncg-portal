'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { ArrowLeft, Info } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Network {
  id: string
  name: string
  displaytext?: string
  state?: string
  type?: string
  cidr?: string
  gateway?: string
  netmask?: string
  dns1?: string
  dns2?: string
  zonename?: string
  zoneid?: string
  vpcname?: string
  vpcid?: string
  networkofferingname?: string
  created?: string
  account?: string
}

interface PublicIP {
  id: string
  ipaddress: string
  state?: string
  associatednetworkid?: string
}

export default function GuestNetworkDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [activeTab, setActiveTab] = useState('overview')

  const { data: networksData, error, isLoading } = useSWR('/api/network/networks', fetcher)
  const { data: ipsData } = useSWR(activeTab === 'ips' ? '/api/network/public-ips' : null, fetcher)

  const networks: Network[] = networksData?.networks || []
  const network = networks.find(n => n.id === id)

  const ips: PublicIP[] = (ipsData?.publicips || ipsData?.publicipaddresses || []).filter(
    (ip: PublicIP) => ip.associatednetworkid === id
  )

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white/10 rounded w-48" />
        <div className="h-48 bg-white/5 rounded-xl" />
      </div>
    )
  }

  if (error || !network) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-center">
        <p className="text-red-400">Network not found</p>
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
          title={network.name}
          action={
            <div className="flex items-center gap-2">
              <StatusBadge status={network.state || 'unknown'} />
              {network.type && <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 capitalize">{network.type}</span>}
            </div>
          }
        />
      </div>

      <div className="flex gap-1 p-1 bg-white/5 rounded-xl w-fit">
        {['overview', 'ips', 'egress'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${activeTab === tab ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}>
            {tab === 'ips' ? 'IP Addresses' : tab === 'egress' ? 'Egress Rules' : tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-white font-semibold mb-4">Network Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'ID', value: network.id },
              { label: 'Name', value: network.name },
              { label: 'CIDR', value: network.cidr || '-' },
              { label: 'Gateway', value: network.gateway || '-' },
              { label: 'Netmask', value: network.netmask || '-' },
              { label: 'DNS 1', value: network.dns1 || '-' },
              { label: 'DNS 2', value: network.dns2 || '-' },
              { label: 'Zone', value: network.zonename || '-' },
              { label: 'VPC', value: network.vpcname || '-' },
              { label: 'Network Offering', value: network.networkofferingname || '-' },
              { label: 'State', value: <StatusBadge status={network.state || 'unknown'} /> },
              { label: 'Created', value: network.created ? new Date(network.created).toLocaleString() : '-' },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 bg-white/5 rounded-lg">
                <p className="text-white/40 text-xs mb-1">{label}</p>
                <div className="text-white text-sm font-medium">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ips' && (
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-white/60 text-sm font-medium">IP Address</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">State</th>
              </tr>
            </thead>
            <tbody>
              {ips.length === 0 ? (
                <tr><td colSpan={2} className="p-8 text-center text-white/40">No IP addresses associated with this network</td></tr>
              ) : ips.map(ip => (
                <tr key={ip.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white font-mono">{ip.ipaddress}</td>
                  <td className="p-4"><StatusBadge status={ip.state || 'unknown'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'egress' && (
        <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-blue-300 text-sm">
            Egress firewall rules control outbound traffic from this network. Configure egress rules via the CloudStack API or management console.
            Default: all egress traffic is allowed unless explicitly restricted.
          </p>
        </div>
      )}
    </motion.div>
  )
}
