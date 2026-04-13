'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Play, Square, RotateCcw, Terminal } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { useVMs } from '@/hooks/useVMs'
import { VirtualMachine } from '@/types/cloudstack'
import { cn } from '@/lib/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const statusColors: Record<string, string> = {
  'Running': 'bg-green-500',
  'Stopped': 'bg-yellow-500',
  'Error': 'bg-red-500',
  'Destroyed': 'bg-gray-500',
  'Starting': 'bg-blue-500 animate-pulse',
  'Stopping': 'bg-orange-500 animate-pulse',
}

export default function UserInstancesPage() {
  const router = useRouter()
  const { vms, isLoading, startVM, stopVM, rebootVM } = useVMs()

  const columns = [
    {
      key: 'name',
      header: 'Name',
      cell: (vm: VirtualMachine) => (
        <div>
          <p className="font-medium text-white">{vm.displayname || vm.name}</p>
          <p className="text-xs text-slate-500">{vm.templatename || '-'}</p>
        </div>
      ),
    },
    {
      key: 'state',
      header: 'Status',
      cell: (vm: VirtualMachine) => (
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full', statusColors[vm.state] || 'bg-gray-500')} />
          <span className="text-sm text-slate-300">{vm.state}</span>
        </div>
      ),
    },
    {
      key: 'ipaddress',
      header: 'IP Address',
      cell: (vm: VirtualMachine) => (
        <span className="text-sm text-slate-300">{vm.ipaddress || '-'}</span>
      ),
    },
    {
      key: 'serviceofferingname',
      header: 'Offering',
      cell: (vm: VirtualMachine) => (
        <span className="text-sm text-slate-300">{vm.serviceofferingname || '-'}</span>
      ),
    },
  ]

  const rowActions = (vm: VirtualMachine) => (
    <div className="flex items-center gap-1">
      {vm.state === 'Stopped' && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            startVM(vm.id)
          }}
          className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
          title="Start"
        >
          <Play className="w-4 h-4" />
        </button>
      )}
      {vm.state === 'Running' && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              stopVM(vm.id)
            }}
            className="p-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors"
            title="Stop"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              rebootVM(vm.id)
            }}
            className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
            title="Reboot"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation()
          window.open(`/api/compute/vms/${vm.id}/console`, '_blank')
        }}
        className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
        title="Console"
      >
        <Terminal className="w-4 h-4" />
      </button>
    </div>
  )

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <PageHeader
        title="My Instances"
        description="Manage your virtual machines"
        action={
          <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Deploy VM
          </button>
        }
      />

      <motion.div variants={itemVariants}>
        <DataTable
          columns={columns}
          data={vms}
          loading={isLoading}
          rowActions={rowActions}
          onRowClick={(vm) => router.push(`/portal/instances/${vm.id}`)}
        />
      </motion.div>
    </motion.div>
  )
}
