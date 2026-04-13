'use client'

import useSWR from 'swr'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Users,
  Server,
  DollarSign,
  TrendingUp,
  Plus,
  FileText,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { StatsCard } from '@/components/shared/StatsCard'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const statusColors: Record<string, string> = {
  enabled: 'bg-green-500',
  disabled: 'bg-red-500',
  locked: 'bg-yellow-500',
}

const revenueData = [
  { day: 'Mon', revenue: 420 },
  { day: 'Tue', revenue: 380 },
  { day: 'Wed', revenue: 510 },
  { day: 'Thu', revenue: 490 },
  { day: 'Fri', revenue: 620 },
  { day: 'Sat', revenue: 390 },
  { day: 'Sun', revenue: 445 },
]

export default function ResellerDashboardPage() {
  const router = useRouter()

  const { data: vmsData, error: vmsError, isLoading: vmsLoading } =
    useSWR('/api/compute/vms', fetcher, { refreshInterval: 30000 })

  const { data: customersData, error: customersError, isLoading: customersLoading } =
    useSWR('/api/accounts?reseller=true', fetcher, { refreshInterval: 60000 })

  const { data: billingData, error: billingError, isLoading: billingLoading } =
    useSWR('/api/billing/usage', fetcher, { refreshInterval: 60000 })

  const vms = vmsData?.vms ?? []
  const customers = customersData?.accounts ?? []
  const activeVMs = vms.filter((v: any) => v.state === 'Running').length
  const totalRevenue = billingData?.totalcost ?? 0
  const commission = totalRevenue * 0.1

  const loading = vmsLoading || customersLoading || billingLoading
  const hasError = vmsError || customersError || billingError

  if (hasError && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-slate-400">Failed to load dashboard data</p>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-white">Reseller Dashboard</h1>
        <p className="text-slate-400 mt-1">Overview of your reseller account</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="My Customers" value={customers.length} icon={Users} loading={loading} />
        <StatsCard title="Active VMs" value={activeVMs} icon={Server} color="green" loading={loading} />
        <StatsCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          color="blue"
          loading={loading}
        />
        <StatsCard
          title="Commission Earned"
          value={`$${commission.toFixed(2)}`}
          icon={TrendingUp}
          color="yellow"
          loading={loading}
        />
      </motion.div>

      {/* Revenue Chart + Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Revenue — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={v => `$${v}`} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(v: number) => [`$${v}`, 'Revenue']}
              />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex flex-col gap-3">
          <h3 className="text-white font-semibold mb-2">Quick Actions</h3>
          <button
            onClick={() => router.push('/reseller/customers')}
            className="flex items-center gap-3 w-full px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 text-blue-400 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Customer
          </button>
          <button
            onClick={() => router.push('/reseller/billing/invoices')}
            className="flex items-center gap-3 w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors"
          >
            <FileText className="w-4 h-4" /> View Invoices
          </button>
          <button
            onClick={() => router.push('/reseller/billing/commissions')}
            className="flex items-center gap-3 w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors"
          >
            <TrendingUp className="w-4 h-4" /> My Commissions
          </button>
        </div>
      </motion.div>

      {/* Customer Table */}
      <motion.div variants={itemVariants} className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Users className="w-4 h-4" /> Top Customers
          </h3>
          <button
            onClick={() => router.push('/reseller/customers')}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            View All
          </button>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white/10 h-10 rounded" />
            ))}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {['Name', 'Email', 'VMs', 'Cost This Month', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.slice(0, 5).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No customers yet</td>
                </tr>
              ) : customers.slice(0, 5).map((customer: any) => (
                <tr
                  key={customer.id}
                  onClick={() => router.push(`/reseller/customers/${customer.id}`)}
                  className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-white">{customer.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{customer.email ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{customer.vmcount ?? 0}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">${(customer.cost ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={cn('w-2 h-2 rounded-full', statusColors[customer.state?.toLowerCase()] ?? 'bg-gray-500')} />
                      <span className="text-sm text-slate-300 capitalize">{customer.state ?? 'Unknown'}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </motion.div>
  )
}
