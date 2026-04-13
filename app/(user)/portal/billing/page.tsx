'use client'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { CreditCard, FileText, Download, DollarSign, Calendar, AlertCircle } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

function StatCard({ icon: Icon, label, value, sub, color = 'text-[var(--accent)]' }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-xs text-[var(--text-muted)]">{label}</p>
        <p className="text-xl font-bold text-[var(--text)]">{value}</p>
        {sub && <p className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

const STATUS_COLORS: Record<string, string> = {
  PAID: 'bg-green-500/20 text-green-400',
  UNPAID: 'bg-yellow-500/20 text-yellow-400',
  OVERDUE: 'bg-red-500/20 text-red-400',
  CANCELLED: 'bg-gray-500/20 text-gray-400',
}

export default function BillingPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/billing/invoices', fetcher)
  const invoices = data?.invoices || []
  const summary = data?.summary || {}

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Billing</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Invoices and payment history</p>
      </div>

      {isLoading && <div className="animate-pulse h-32 bg-white/5 rounded-xl" />}

      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard icon={DollarSign} label="Total Billed" value={`${(summary.totalBilled || 0).toLocaleString()} MMK`} />
          <StatCard icon={AlertCircle} label="Outstanding" value={`${(summary.outstanding || 0).toLocaleString()} MMK`} color="text-yellow-400" />
          <StatCard icon={FileText} label="Total Invoices" value={invoices.length} sub={`${invoices.filter((i: any) => i.status === 'UNPAID').length} unpaid`} />
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-xl">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-[var(--text)]">Invoice History</h2>
        </div>

        {isLoading && <div className="animate-pulse h-64 m-4 bg-white/5 rounded-xl" />}
        {error && <div className="p-4 text-red-400 text-sm">Failed to load. <button onClick={() => mutate()} className="underline">Retry</button></div>}

        {!isLoading && invoices.length === 0 && (
          <div className="p-12 text-center">
            <CreditCard className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-[var(--text-muted)] text-sm">No invoices yet</p>
          </div>
        )}

        {invoices.length > 0 && (
          <div className="divide-y divide-white/5">
            {invoices.map((inv: any) => (
              <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <FileText className="w-5 h-5 text-[var(--text-muted)]" />
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">{inv.invoiceNo}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '—'}
                      {inv.dueAt ? ` • Due ${new Date(inv.dueAt).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm font-semibold text-[var(--text)]">{(inv.amountMMK || 0).toLocaleString()} MMK</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[inv.status] || 'bg-gray-500/20 text-gray-400'}`}>
                    {inv.status}
                  </span>
                  <button className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-muted)] transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
