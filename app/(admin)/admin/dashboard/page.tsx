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
import { WaveChart } from '@/components/charts/WaveChart'

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
        <h1 className="text-2xl font-semibold text-[var(--text)]">Dashboard</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">Welcome to your admin dashboard</p>
      </motion.div>

      {/* Stats row - 4 cards like shadcnStore */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Revenue" 
          value="$1,250.00" 
          percentChange="+12.5%"
          trend={{ positive: true, value: "12.5", text: "Trending up this month" }}
          loading={loading} 
        />
        <StatsCard 
          title="New Customers" 
          value="1,234" 
          percentChange="-20%"
          trend={{ positive: false, value: "20", text: "Down 20% this period" }}
          loading={loading} 
        />
        <StatsCard 
          title="Active Accounts" 
          value="45,678" 
          percentChange="+12.5%"
          trend={{ positive: true, value: "12.5", text: "Strong user retention" }}
          loading={loading} 
        />
        <StatsCard 
          title="Growth Rate" 
          value="4.5%" 
          percentChange="+4.5%"
          trend={{ positive: true, value: "4.5", text: "Steady performance increase" }}
          loading={loading} 
        />
      </motion.div>

      {/* Wave Chart - Total Visitors */}
      <motion.div variants={itemVariants}>
        <WaveChart 
          title="Total Visitors" 
          subtitle="Total for the last 3 months"
        />
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
