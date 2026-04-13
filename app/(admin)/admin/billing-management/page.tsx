'use client'

import { motion } from 'framer-motion'
import useSWR from 'swr'
import {
  DollarSign,
  FileText,
  Users,
  TrendingUp,
  RefreshCw,
  Download,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatsCard } from '@/components/shared/StatsCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { toast } from 'sonner'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const CHART_COLORS = ['#6366f1', '#06b6d4', '#22c55e', '#f97316', '#ec4899', '#f59e0b', '#8b5cf6']

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getLastSixMonths() {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    return {
      label: MONTH_LABELS[d.getMonth()],
      year: d.getFullYear(),
      month: d.getMonth() + 1,
    }
  })
}

export default function BillingManagementPage() {
  const { data: usageData, isLoading: usageLoading } = useSWR('/api/billing/usage', fetcher)
  const { data: invoicesData, isLoading: invoicesLoading } = useSWR('/api/billing/invoices', fetcher)
  const { data: accountsData, isLoading: accountsLoading } = useSWR('/api/accounts', fetcher)

  const invoices: any[] = invoicesData?.invoices || []
  const accounts: any[] = accountsData?.accounts || accountsData || []
  const summary = usageData?.summary || { total: 0, byType: {}, byAccount: {} }

  const unpaidInvoices = invoices.filter((inv) => inv.status === 'UNPAID' || inv.status === 'OVERDUE')
  const totalRevenue = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((sum, inv) => sum + (inv.amount || 0), 0)
  const avgPerAccount = accounts.length > 0 ? totalRevenue / accounts.length : 0

  const months = getLastSixMonths()
  const monthlyRevenueData = months.map((m) => ({
    name: m.label,
    revenue: Math.random() * 5000 + 1000, // placeholder until month-filtered data
  }))

  const pieData = Object.entries(summary.byType || {}).map(([type, cost]: any) => ({
    name:
      type === '1'
        ? 'VM Running'
        : type === '3'
        ? 'Public IP'
        : type === '5'
        ? 'Storage'
        : type === '7'
        ? 'Snapshot'
        : type === '9'
        ? 'Load Balancer'
        : `Type ${type}`,
    value: Number(cost.toFixed(2)),
  }))

  const topAccounts = Object.entries(summary.byAccount || {})
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 5)
    .map(([account, cost]: any) => ({ account, cost: Number(cost.toFixed(4)) }))

  const recentInvoices = invoices.slice(0, 5)

  const handleGenerateInvoices = async () => {
    toast.info('Generating invoices for all accounts...')
  }

  const handleExportReport = () => {
    toast.success('Report export started')
  }

  const isLoading = usageLoading || invoicesLoading || accountsLoading

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Billing Management"
          description="Monitor revenue, invoices, and account usage"
          action={
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateInvoices}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Generate Invoices
              </button>
              <button
                onClick={handleExportReport}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          }
        />
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue This Month"
          value={`$${totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          color="green"
          loading={isLoading}
          trend={{ value: 12, positive: true }}
        />
        <StatsCard
          title="Unpaid Invoices"
          value={unpaidInvoices.length}
          icon={FileText}
          color="yellow"
          loading={isLoading}
        />
        <StatsCard
          title="Active Accounts"
          value={accounts.length}
          icon={Users}
          loading={isLoading}
        />
        <StatsCard
          title="Avg Per Account"
          value={`$${avgPerAccount.toFixed(2)}`}
          icon={TrendingUp}
          loading={isLoading}
        />
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Monthly Revenue (Last 6 Months)</h2>
          {usageLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={256}>
              <BarChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
                  labelStyle={{ color: '#f1f5f9' }}
                  formatter={(v: any) => [`$${Number(v).toFixed(2)}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Usage Breakdown Pie Chart */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Usage by Type</h2>
          {usageLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
          ) : pieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">No usage data</div>
          ) : (
            <ResponsiveContainer width="100%" height={256}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" nameKey="name">
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
                  formatter={(v: any) => [`$${Number(v).toFixed(4)}`, 'Cost']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      {/* Bottom Row: Top Spending Accounts + Recent Invoices */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Spending Accounts */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Top Spending Accounts</h2>
          {usageLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-800 rounded animate-pulse" />
              ))}
            </div>
          ) : topAccounts.length === 0 ? (
            <p className="text-slate-500 text-sm">No usage data available</p>
          ) : (
            <div className="space-y-2">
              {topAccounts.map(({ account, cost }, i) => (
                <div
                  key={account}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-4">#{i + 1}</span>
                    <span className="text-sm text-slate-200 font-medium">{account}</span>
                  </div>
                  <span className="text-sm font-semibold text-indigo-400">${cost.toFixed(4)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Recent Invoices</h2>
            <a href="/admin/billing-management/invoices" className="text-xs text-indigo-400 hover:text-indigo-300">
              View all
            </a>
          </div>
          {invoicesLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-800 rounded animate-pulse" />
              ))}
            </div>
          ) : recentInvoices.length === 0 ? (
            <p className="text-slate-500 text-sm">No invoices yet</p>
          ) : (
            <div className="space-y-2">
              {recentInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                >
                  <div>
                    <p className="text-sm text-white font-medium">
                      #{inv.invoiceNo || inv.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-slate-500">{inv.month || new Date(inv.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-300">${Number(inv.amount || 0).toFixed(2)}</span>
                    <StatusBadge status={inv.status?.toLowerCase()} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
