import useSWR from 'swr'
import { Network, VPC } from '@/types/cloudstack'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useNetworks() {
  const { data, error, isLoading, mutate } = useSWR('/api/network/networks', fetcher)

  return {
    networks: data?.networks || [] as Network[],
    count: data?.count || 0,
    isLoading,
    error,
    mutate,
  }
}

export function useVPCs() {
  const { data, error, isLoading, mutate } = useSWR('/api/network/vpc', fetcher)

  const createVPC = async (body: any) => {
    const res = await fetch('/api/network/vpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    mutate()
    return res.json()
  }

  return {
    vpcs: data?.vpcs || [] as VPC[],
    count: data?.count || 0,
    isLoading,
    error,
    createVPC,
    mutate,
  }
}
