'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Plus,
  Eye,
  Settings,
  FileText,
  Ban,
  AlertCircle,
  RefreshCw,
  X,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
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
  enabled: 'text-green-400 bg-green-500/20',
  disabled: 'text-red-400 bg-red-500/20',
  locked: 'text-yellow-400 bg-yellow-500/20',
}

interface Customer {
  id: string
  name: string
  email?: string
  vmcount?: number
  volumecount?: number
  storage?: number
  cost?: number
  state?: string
  domain?: string
  domainid?: string
}

interface AddCustomerForm {
  username: string
  password: string
  email: string
  firstname: string
  lastname: string
}

export default function ResellerCustomersPage() {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<AddCustomerForm>({
    username: '',
    password: '',
    email: '',
    firstname: '',
    lastname: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const { data, error, isLoading, mutate } =
    useSWR('/api/accounts?reseller=true', fetcher, { refreshInterval: 60000 })

  const { data: billingData } =
    useSWR('/api/billing/usage', fetcher, { refreshInterval: 120000 })

  const customers: Customer[] = data?.accounts ?? []

  const getCost = (customerName: string) => {
    if (!billingData?.usageRecords) return 0
    const records = billingData.usageRecords.filter((r: any) => r.account === customerName)
    return records.reduce((sum: number, r: any) => sum + (r.cost ?? 0), 0)
  }

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create customer')
      toast.success('Customer created successfully')
      setModalOpen(false)
      setForm({ username: '', password: '', email: '', firstname: '', lastname: '' })
      mutate()
    } catch (err: any) {
      toast.error(err.message || 'Failed to create customer')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDisable = async (id: string, name: string) => {
    if (!confirm(`Disable customer "${name}"?`)) return
    try {
      const res = await fetch(`/api/accounts/${id}/disable`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to disable customer')
      toast.success('Customer disabled')
      mutate()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  if (error && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-slate-400">Failed to load customers</p>
        <button
          onClick={() => mutate()}
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
      <motion.div variants={itemVariants}>
        <PageHeader
          title="My Customers"
          description="Manage your customer accounts"
          action={
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Customer
            </button>
          }
        />
      </motion.div>

      <motion.div variants={itemVariants} className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white/10 h-12 rounded" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Name', 'Email', 'VMs', 'Volumes', 'Storage', 'Cost This Month', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-slate-500">No customers found</td>
                  </tr>
                ) : customers.map((c) => (
                  <tr key={c.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-white">{c.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{c.email ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{c.vmcount ?? 0}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{c.volumecount ?? 0}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{c.storage ? `${c.storage} GB` : '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">${getCost(c.name).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded text-xs font-medium capitalize', statusColors[c.state?.toLowerCase() ?? ''] ?? 'text-slate-400 bg-slate-700')}>
                        {c.state ?? 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => router.push(`/reseller/customers/${c.id}`)}
                          className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => router.push(`/reseller/compute/instances?account=${c.name}`)}
                          className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                          title="Manage Resources"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => router.push(`/reseller/billing/invoices?customer=${c.id}`)}
                          className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                          title="Create Invoice"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDisable(c.id, c.name)}
                          className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                          title="Disable"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add Customer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Add Customer</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              {[
                { label: 'Username', key: 'username', type: 'text', placeholder: 'john_doe' },
                { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'john@example.com' },
                { label: 'First Name', key: 'firstname', type: 'text', placeholder: 'John' },
                { label: 'Last Name', key: 'lastname', type: 'text', placeholder: 'Doe' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm text-slate-400 mb-1">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={form[key as keyof AddCustomerForm]}
                    onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creating…' : 'Create Customer'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
