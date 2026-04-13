import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export interface Alert {
  id: string
  type: number
  name?: string
  subject: string
  description: string
  sent: string
}

export function useAlerts() {
  const { data, error, isLoading, mutate } = useSWR<Alert[]>(
    '/api/infrastructure/alerts',
    fetcher,
    { refreshInterval: 60000 }
  )

  return {
    alerts: data || [],
    isLoading,
    error,
    mutate
  }
}
