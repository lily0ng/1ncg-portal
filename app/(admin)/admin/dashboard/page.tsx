'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Server,
  Play,
  HardDrive,
  Users,
  AlertTriangle,
  Activity,
  Cpu,
  Network,
} from 'lucide-react'
import { StatsCard } from '@/components/shared/StatsCard'
import { VMStatusChart } from '@/components/dashboard/VMStatusChart'
import { ResourceUsageChart } from '@/components/dashboard/ResourceUsageChart'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { TopConsumers } from '@/components/dashboard/TopConsumers'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function AdminDashboardPage() {
  const [vms, setVms] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [vmsRes, summaryRes] = await Promise.all([
          fetch('/api/compute/vms'),
          fetch('/api/dashboard/summary'),
        ])
        const vmsData = await vmsRes.json()
        const summaryData = await summaryRes.json()
        setVms(vmsData.vms || [])
        setSummary(summaryData)
      } catch (error) {
        console.error('Dashboard fetch error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const totalVMs = vms.length
  const runningVMs = vms.filter((v) => v.state === 'Running').length
  const totalStorageGB = summary
    ? Math.round((summary.storage?.primaryUsed?.total || 0) / (1024 ** 3))
    : 0
  const totalHosts = summary?.infrastructure?.hosts ?? 0
  const alertCount = summary?.alerts?.length ?? 0
  const cpuPercent = Math.round(summary?.compute?.cpu?.percent ?? 0)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-[var(--text)]">Dashboard</h1>
        <p className="text-[var(--text-muted)]">Overview of your CloudStack infrastructure</p>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard title="Total VMs" value={totalVMs} icon={Server} loading={loading} />
        <StatsCard title="Running VMs" value={runningVMs} icon={Play} loading={loading} color="green" />
        <StatsCard
          title="Storage"
          value={totalStorageGB > 0 ? `${totalStorageGB} GB` : '—'}
          icon={HardDrive}
          loading={loading}
        />
        <StatsCard title="Hosts" value={totalHosts} icon={Cpu} loading={loading} />
        <StatsCard title="CPU Usage" value={`${cpuPercent}%`} icon={Activity} loading={loading} color={cpuPercent > 80 ? 'red' : 'green'} />
        <StatsCard title="Alerts" value={alertCount} icon={AlertTriangle} loading={loading} color={alertCount > 0 ? 'red' : 'green'} />
      </motion.div>

      {/* Charts row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <VMStatusChart vms={vms} loading={loading} />
        <ResourceUsageChart summary={summary} loading={loading} />
        <RevenueChart />
      </motion.div>

      {/* Bottom row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivity events={summary?.events} loading={loading} />
        <TopConsumers />
        <QuickActions />
      </motion.div>
    </motion.div>
  )
}
