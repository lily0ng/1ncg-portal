'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Server,
  Play,
  HardDrive,
  DollarSign,
  Plus,
} from 'lucide-react'
import { StatsCard } from '@/components/shared/StatsCard'
import { VMStatusChart } from '@/components/dashboard/VMStatusChart'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { DataTable } from '@/components/shared/DataTable'
import { VirtualMachine } from '@/types/cloudstack'
import { useRouter } from 'next/navigation'
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

export default function UserDashboardPage() {
  const router = useRouter()
  const [vms, setVMs] = useState<VirtualMachine[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    myVMs: 0,
    running: 0,
    storageUsed: 0,
    monthCost: 0,
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/compute/vms')
        const data = await res.json()
        const vmsList = data.vms || []
        const runningCount = vmsList.filter((vm: any) => vm.state === 'Running').length
        
        setVMs(vmsList.slice(0, 5))
        setStats({
          myVMs: data.count || 0,
          running: runningCount,
          storageUsed: 450,
          monthCost: 125.50,
        })
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400">Welcome back to your CloudStack portal</p>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="My VMs"
          value={stats.myVMs}
          icon={Server}
          loading={loading}
        />
        <StatsCard
          title="Running"
          value={stats.running}
          icon={Play}
          color="green"
          loading={loading}
        />
        <StatsCard
          title="Storage Used"
          value={`${stats.storageUsed} GB`}
          icon={HardDrive}
          loading={loading}
        />
        <StatsCard
          title="This Month Cost"
          value={`$${stats.monthCost.toFixed(2)}`}
          icon={DollarSign}
          color="blue"
          loading={loading}
        />
      </motion.div>

      {/* Main content */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* VM List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">My Instances</h3>
            <button
              onClick={() => router.push('/portal/instances')}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              View All
            </button>
          </div>
          <DataTable
            columns={columns}
            data={vms}
            loading={loading}
            searchable={false}
            pageSize={5}
            onRowClick={(vm) => router.push(`/portal/instances/${vm.id}`)}
          />
        </div>

        {/* Side panel */}
        <div className="space-y-6">
          <QuickActions />
          <RecentActivity />
        </div>
      </motion.div>
    </motion.div>
  )
}
