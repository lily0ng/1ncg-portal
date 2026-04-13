'use client'

import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import { ArrowLeft, Printer, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { toast } from 'sonner'
import { useState } from 'react'

const fetcher = (url: string) => fetch(url).then((r) => r.json())
const MMK_RATE = 2100
const PORTAL_NAME = 'Cloud Management Portal'

export default function InvoiceDetailPage() {
  const _p = useParams<{ id: string }>()
  const id = _p?.id ?? ''
  const router = useRouter()
  const { data, isLoading, error, mutate } = useSWR(`/api/billing/invoices/${id}`, fetcher)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const invoice = data?.invoice

  const handleMarkPaid = async () => {
    setActionLoading('paid')
    try {
      const res = await fetch(`/api/billing/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAID' }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Invoice marked as paid')
      mutate()
    } catch {
      toast.error('Failed to update invoice')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async () => {
    setActionLoading('cancel')
    try {
      const res = await fetch(`/api/billing/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Invoice cancelled')
      mutate()
    } catch {
      toast.error('Failed to cancel invoice')
    } finally {
      setActionLoading(null)
    }
  }

  const handlePrint = () => window.print()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-400">Failed to load invoice</p>
        <button onClick={() => router.back()} className="text-sm text-slate-400 hover:text-white">
          Go back
        </button>
      </div>
    )
  }

  const invoiceNo = invoice.invoiceNo || id?.slice(0, 8).toUpperCase()
  const items: any[] = invoice.items || []
  const totalUSD = Number(invoice.amount || 0)
  const totalMMK = totalUSD * MMK_RATE

  return (
    <>
      {/* Screen-only header */}
      <div className="print:hidden space-y-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Invoice #{invoiceNo}</h1>
              <StatusBadge status={invoice.status?.toLowerCase()} />
            </div>
            <p className="text-slate-400 text-sm mt-0.5">
              Created {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : '-'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(invoice.status === 'UNPAID' || invoice.status === 'OVERDUE') && (
              <button
                onClick={handleMarkPaid}
                disabled={actionLoading === 'paid'}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {actionLoading === 'paid' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Mark as Paid
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Printer className="w-4 h-4" />
              Download / Print
            </button>
            {invoice.status !== 'CANCELLED' && invoice.status !== 'PAID' && (
              <button
                onClick={handleCancel}
                disabled={actionLoading === 'cancel'}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {actionLoading === 'cancel' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Document (print-friendly) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white text-slate-900 rounded-xl p-8 max-w-3xl mx-auto print:rounded-none print:shadow-none print:max-w-full"
        id="invoice-print"
      >
        {/* Invoice Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{PORTAL_NAME}</h2>
            <p className="text-slate-500 text-sm mt-1">Cloud Infrastructure Services</p>
          </div>
          <div className="text-right">
            <h3 className="text-xl font-bold text-slate-900">INVOICE</h3>
            <p className="text-slate-500 text-sm">#{invoiceNo}</p>
            <p className="text-slate-500 text-sm">
              Date: {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : '-'}
            </p>
            {invoice.dueDate && (
              <p className="text-slate-500 text-sm">
                Due: {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-8 p-4 bg-slate-50 rounded-lg">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Bill To</h4>
          <p className="font-semibold text-slate-900">
            {invoice.user?.name || invoice.user?.username || invoice.userId || 'N/A'}
          </p>
          <p className="text-slate-500 text-sm">{invoice.user?.email || '-'}</p>
          {invoice.month && (
            <p className="text-slate-500 text-sm">Period: {invoice.month}</p>
          )}
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Resource
                </th>
                <th className="text-left py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-right py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Usage
                </th>
                <th className="text-right py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="text-right py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-400 text-sm">
                    No line items
                  </td>
                </tr>
              ) : (
                items.map((item: any, i: number) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-2.5 text-sm text-slate-700">
                      {item.resourceName || item.description || `Resource ${i + 1}`}
                    </td>
                    <td className="py-2.5 text-sm text-slate-500">
                      {item.usagetype || item.usageType || '-'}
                    </td>
                    <td className="py-2.5 text-sm text-slate-700 text-right">
                      {Number(item.rawusage || item.usage || 0).toFixed(2)}h
                    </td>
                    <td className="py-2.5 text-sm text-slate-700 text-right">
                      ${Number(item.rate || 0).toFixed(4)}
                    </td>
                    <td className="py-2.5 text-sm text-slate-900 font-medium text-right">
                      ${Number(item.cost || 0).toFixed(4)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal (USD)</span>
              <span>${totalUSD.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Exchange Rate</span>
              <span>1 USD = {MMK_RATE.toLocaleString()} MMK</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-2 text-base">
              <span>Total (USD)</span>
              <span>${totalUSD.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-700 text-sm">
              <span>Total (MMK)</span>
              <span>{totalMMK.toLocaleString()} K</span>
            </div>
          </div>
        </div>

        {/* Status & Payment Info */}
        <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-sm text-slate-500">
          <div>
            <span className="font-medium text-slate-700">Payment Status: </span>
            <span
              className={
                invoice.status === 'PAID'
                  ? 'text-green-600 font-semibold'
                  : invoice.status === 'OVERDUE'
                  ? 'text-red-600 font-semibold'
                  : 'text-yellow-600 font-semibold'
              }
            >
              {invoice.status}
            </span>
          </div>
          {invoice.paidAt && (
            <div>
              <span className="font-medium text-slate-700">Paid On: </span>
              {new Date(invoice.paidAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}
