'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { ArrowLeft, Server, HardDrive } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Project {
  id: string
  name: string
  displaytext?: string
  domain?: string
  domainid?: string
  state?: string
  owner?: string
  account?: string
  created?: string
  cputotal?: number
  memorytotal?: number
  networklimit?: string
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [activeTab, setActiveTab] = useState('overview')

  const { data: projectsData, error, isLoading } = useSWR('/api/projects', fetcher)
  const { data: vmsData } = useSWR(activeTab === 'resources' ? '/api/compute/vms' : null, fetcher)
  const { data: volumesData } = useSWR(activeTab === 'resources' ? '/api/storage/volumes' : null, fetcher)

  const projects: Project[] = projectsData?.projects || []
  const project = projects.find(p => p.id === id)

  const vms = (vmsData?.vms || vmsData?.virtualmachine || []).filter((v: { projectid?: string }) => v.projectid === id)
  const volumes = (volumesData?.volumes || []).filter((v: { projectid?: string }) => v.projectid === id)

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white/10 rounded w-64" />
        <div className="h-48 bg-white/5 rounded-xl" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-center">
        <p className="text-red-400">Project not found</p>
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
          title={project.name}
          action={<StatusBadge status={project.state || 'active'} />}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl w-fit">
        {['overview', 'resources'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              activeTab === tab ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-white font-semibold mb-4">Project Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'ID', value: project.id },
              { label: 'Name', value: project.name },
              { label: 'Display Name', value: project.displaytext || '-' },
              { label: 'Domain', value: project.domain || '-' },
              { label: 'State', value: <StatusBadge status={project.state || 'active'} /> },
              { label: 'Owner', value: project.owner || project.account || '-' },
              { label: 'Created', value: project.created ? new Date(project.created).toLocaleString() : '-' },
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {vms.length === 0 && <p className="text-white/40 text-sm text-center py-4">No VMs in this project</p>}
            </div>

            <div className="rounded-xl bg-white/5 border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <HardDrive className="w-5 h-5 text-purple-400" />
                <h3 className="text-white font-semibold">Volumes</h3>
                <span className="ml-auto text-2xl font-bold text-white">{volumes.length}</span>
              </div>
              {volumes.slice(0, 5).map((vol: { id: string; name: string; size?: number; state?: string }) => (
                <div key={vol.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-white/80 text-sm">{vol.name}</span>
                  <span className="text-white/40 text-xs">{vol.size ? `${Math.round(vol.size / 1073741824)} GB` : '-'}</span>
                </div>
              ))}
              {volumes.length === 0 && <p className="text-white/40 text-sm text-center py-4">No volumes in this project</p>}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
