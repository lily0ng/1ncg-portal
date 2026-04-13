import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useUsage(start?: string, end?: string) {
  const params = new URLSearchParams()
  if (start) params.append('start', start)
  if (end) params.append('end', end)
  
  const { data, error, isLoading } = useSWR(
    `/api/billing/usage?${params.toString()}`,
    fetcher
  )

  return {
    records: data?.records || [],
    summary: data?.summary,
    period: data?.period,
    isLoading,
    error,
  }
}

export function useInvoices() {
  const { data, error, isLoading, mutate } = useSWR('/api/billing/invoices', fetcher)

  return {
    invoices: data?.invoices || [],
    isLoading,
    error,
    mutate,
  }
}

export function usePricing() {
  const { data, error, isLoading } = useSWR('/api/pricing', fetcher)

  return {
    plans: data?.plans || [],
    isLoading,
    error,
  }
}
