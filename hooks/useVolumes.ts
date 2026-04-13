import useSWR from 'swr'
import { Volume } from '@/types/cloudstack'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useVolumes() {
  const { data, error, isLoading, mutate } = useSWR('/api/storage/volumes', fetcher)

  const createVolume = async (body: any) => {
    const res = await fetch('/api/storage/volumes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    mutate()
    return res.json()
  }

  return {
    volumes: data?.volumes || [] as Volume[],
    count: data?.count || 0,
    isLoading,
    error,
    createVolume,
    mutate,
  }
}
