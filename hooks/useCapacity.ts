import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export interface CapacityEntry {
  capacitytype: number
  capacitytypename?: string
  capacityused: number
  capacitytotal: number
  percentused: string
  zoneid?: string
  zonename?: string
  podid?: string
  podname?: string
  clusterid?: string
  clustername?: string
  type?: number
}

export function useCapacity() {
  const { data, error, isLoading, mutate } = useSWR<CapacityEntry[]>(
    '/api/infrastructure/capacity',
    fetcher,
    { refreshInterval: 60000 }
  )

  return {
    capacity: data || [],
    isLoading,
    error,
    mutate
  }
}
