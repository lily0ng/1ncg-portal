'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import {
  Plus,
  Eye,
  CheckCircle,
  Download,
  XCircle,
  Search,
  Filter,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
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

const STATUS_FILTERS = ['All', 'UNPAID', 'PAID', 'OVERDUE', 'CANCELLED']

const MMK_RATE = 2100

interface GenerateInvoiceForm {
  userId: string
  month: string
}

export default function InvoicesPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/billing/invoices', fetcher)
  const { data: accountsData } = useSWR('/api/accounts', fetcher)

  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [generateForm, setGenerateForm] = useState<GenerateInvoiceForm>({ userId: '', month: '' })
  const [generating, setGenerating] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const invoices: any[] = data?.invoices || []
  const accounts: any[] = accountsData?.accounts || accountsData || []

  const filtered = invoices.filter((inv) => {
    const matchStatus = statusFilter === 'All' || inv.status === statusFilter
    const matchSearch =
      !search ||
      inv.id?.toLowerCase().includes(search.toLowerCase()) ||
      inv.userId?.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNo?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const handleMarkPaid = async (id: string) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/billing/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAID' }),
      })
      if (!res.ok) throw new Error('Failed to mark as paid')
      toast.success('Invoice marked as paid')
      mutate()
    } catch (e: any) {
      toast.error(e.message || 'Error updating invoice')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (id: string) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/billing/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })
      if (!res.ok) throw new Error('Failed to cancel invoice')
      toast.success('Invoice cancelled')
      mutate()
    } catch (e: any) {
      toast.error(e.message || 'Error cancelling invoice')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDownload = (id: string) => {
    window.open(`/admin/billing-management/invoices/${id}?print=1`, '_blank')
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!generateForm.userId || !generateForm.month) {
      toast.error('Please select account and month')
      return
    }
    setGenerating(true)
    try {
      const [year, month] = generateForm.month.split('-')
      const start = `${year}-${month}-01`
      const endDate = new Date(Number(year), Number(month), 0)
      const end = endDate.toISOString().split('T')[0]
      const usageRes = await fetch(`/api/billing/usage?start=${start}&end=${end}`)
      const usageData = await usageRes.json()
      const amount = usageData?.summary?.total || 0
      const res = await fetch('/api/billing/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: generateForm.userId,
          month: generateForm.month,
          amount,
          items: usageData?.records?.slice(0, 20) || [],
        }),
      })
      if (!res.ok) throw new Error('Failed to generate invoice')
      toast.success('Invoice generated successfully')
      setShowGenerateModal(false)
      setGenerateForm({ userId: '', month: '' })
      mutate()
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate invoice')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Invoices"
          description="Manage and track all billing invoices"
          action={
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Generate Invoice
            </button>
          }
        />
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by invoice # or account..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants} className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {['Invoice #', 'Account', 'Period', 'Amount (USD)', 'Amount (MMK)', 'Status', 'Due Date', 'Created', 'Actions'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    {[...Array(9)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-red-400 text-sm">
                    Failed to load invoices
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500 text-sm">
                    No invoices found
                  </td>
                </tr>
              ) : (
                filtered.map((inv, index) => (
                  <motion.tr
                    key={inv.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-indigo-400">
                      #{inv.invoiceNo || inv.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">{inv.userId || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{inv.month || '-'}</td>
                    <td className="px-4 py-3 text-sm text-white font-medium">
                      ${Number(inv.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {(Number(inv.amount || 0) * MMK_RATE).toLocaleString()} K
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inv.status?.toLowerCase()} />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <a
                          href={`/admin/billing-management/invoices/${inv.id}`}
                          className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                        {(inv.status === 'UNPAID' || inv.status === 'OVERDUE') && (
                          <button
                            onClick={() => handleMarkPaid(inv.id)}
                            disabled={actionLoading === inv.id}
                            className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
                            title="Mark as Paid"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(inv.id)}
                          className="p-1.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        {inv.status !== 'CANCELLED' && inv.status !== 'PAID' && (
                          <button
                            onClick={() => handleCancel(inv.id)}
                            disabled={actionLoading === inv.id}
                            className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                            title="Cancel"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Generate Invoice Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Generate Invoice</h2>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Account</label>
                <select
                  value={generateForm.userId}
                  onChange={(e) => setGenerateForm((f) => ({ ...f, userId: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select account...</option>
                  {accounts.map((acc: any) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name || acc.username || acc.email || acc.id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Month</label>
                <input
                  type="month"
                  value={generateForm.month}
                  onChange={(e) => setGenerateForm((f) => ({ ...f, month: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
