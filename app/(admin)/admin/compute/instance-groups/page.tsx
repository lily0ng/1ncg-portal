'use client'

import useSWR from 'swr'
import { motion } from 'framer-motion'
import { AlertCircle, RefreshCw, Layers, Server } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface VirtualMachine {
  id: string
  name: string
  displayname?: string
  state: string
  instancegroupname?: string
  instancegroupid?: string
}

interface InstanceGroup {
  name: string
  vms: VirtualMachine[]
}

export default function InstanceGroupsPage() {
  const { data, error, isLoading, mutate } =
    useSWR<{ vms: VirtualMachine[] }>('/api/compute/vms', fetcher, { refreshInterval: 30000 })

  // Derive instance groups from VM instancegroupname field
  const groups: InstanceGroup[] = (() => {
    const vms = data?.vms ?? []
    const map = new Map<string, VirtualMachine[]>()
    for (const vm of vms) {
      const key = vm.instancegroupname?.trim() || '__ungrouped__'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(vm)
    }
    return Array.from(map.entries())
      .filter(([name]) => name !== '__ungrouped__')
      .map(([name, vms]) => ({ name, vms }))
      .sort((a, b) => a.name.localeCompare(b.name))
  })()

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-slate-400">Failed to load instance groups</p>
        <button onClick={() => mutate()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
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
      <PageHeader
        title="Instance Groups"
        description="VMs grouped by their CloudStack instance group name"
      />

      {/* Feature note */}
      <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <Layers className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-blue-300 text-sm font-medium">Feature via CloudStack</p>
          <p className="text-blue-400/70 text-xs mt-0.5">
            Instance groups are derived from the <code className="bg-blue-900/40 px-1 rounded">instancegroupname</code> field on each VM.
            Assign VMs to groups via the Deploy VM wizard or CloudStack API (<code className="bg-blue-900/40 px-1 rounded">createInstanceGroup</code>).
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white/10 h-24 rounded-xl" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 gap-4 bg-slate-900/50 border border-slate-800 rounded-xl"
        >
          <Layers className="w-16 h-16 text-slate-600" />
          <h3 className="text-lg font-medium text-slate-400">No Instance Groups Found</h3>
          <p className="text-sm text-slate-500 text-center max-w-sm">
            No VMs have been assigned to instance groups. Groups appear automatically when VMs have an <code className="bg-slate-800 px-1 rounded">instancegroupname</code> set.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {groups.map((group, idx) => (
            <motion.div
              key={group.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden"
            >
              {/* Group Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Layers className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{group.name}</h3>
                    <p className="text-xs text-slate-400">{group.vms.length} VM{group.vms.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-slate-700 rounded-full text-xs text-slate-300 font-medium">
                  {group.vms.length} member{group.vms.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* VM List */}
              <div className="divide-y divide-slate-800/50">
                {group.vms.map(vm => (
                  <div key={vm.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-800/20 transition-colors">
                    <Server className="w-4 h-4 text-slate-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{vm.displayname || vm.name}</p>
                      <p className="text-xs text-slate-500 font-mono truncate">{vm.id}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                      vm.state === 'Running' ? 'text-green-400' :
                      vm.state === 'Stopped' ? 'text-gray-400' :
                      vm.state === 'Error' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        vm.state === 'Running' ? 'bg-green-500 animate-pulse' :
                        vm.state === 'Stopped' ? 'bg-gray-500' :
                        vm.state === 'Error' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      {vm.state}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
