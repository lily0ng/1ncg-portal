import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export interface Host {
  id: string
  name: string
  state: string
  type: string
  ipaddress: string
  zoneid: string
  zonename: string
  podid?: string
  podname?: string
  clusterid?: string
  clustername?: string
  hypervisor?: string
  cpunumber?: number
  cpuspeed?: number
  cpuallocated?: string
  cpuused?: string
  memorytotal?: number
  memoryallocated?: number
  memoryused?: number
  networkkbsread?: number
  networkkbswrite?: number
  version?: string
  osdisplayname?: string
  created?: string
  lastpinged?: string
}

export function useHosts() {
  const { data, error, isLoading, mutate } = useSWR<Host[]>(
    '/api/infrastructure/hosts',
    fetcher,
    { refreshInterval: 30000 }
  )

  return {
    hosts: data || [],
    isLoading,
    error,
    mutate
  }
}
