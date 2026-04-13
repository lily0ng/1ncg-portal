import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export interface Invoice {
  id: string
  userId: string
  amount: number
  currency: string
  status: 'paid' | 'unpaid' | 'overdue' | 'cancelled'
  dueDate: string
  paidAt?: string | null
  description?: string | null
  createdAt: string
  updatedAt: string
}

export function useInvoices() {
  const { data, error, isLoading, mutate } = useSWR<{ invoices: Invoice[] }>(
    '/api/billing/invoices',
    fetcher
  )

  const markPaid = async (id: string) => {
    const res = await fetch(`/api/billing/invoices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paid', paidAt: new Date().toISOString() })
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to mark invoice as paid')
    }
    await mutate()
    return res.json()
  }

  const generateInvoice = async (body: {
    userId: string
    amount: number
    currency?: string
    dueDate: string
    description?: string
  }) => {
    const res = await fetch('/api/billing/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to generate invoice')
    }
    await mutate()
    return res.json()
  }

  return {
    invoices: data?.invoices || [],
    isLoading,
    error,
    mutate,
    markPaid,
    generateInvoice
  }
}
