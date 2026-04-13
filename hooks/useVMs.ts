import useSWR from 'swr'
import { VirtualMachine } from '@/types/cloudstack'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useVMs() {
  const { data, error, isLoading, mutate } = useSWR('/api/compute/vms', fetcher)

  const startVM = async (id: string) => {
    await fetch(`/api/compute/vms/${id}/start`, { method: 'POST' })
    mutate()
  }

  const stopVM = async (id: string) => {
    await fetch(`/api/compute/vms/${id}/stop`, { method: 'POST' })
    mutate()
  }

  const rebootVM = async (id: string) => {
    await fetch(`/api/compute/vms/${id}/reboot`, { method: 'POST' })
    mutate()
  }

  const deleteVM = async (id: string) => {
    await fetch(`/api/compute/vms/${id}`, { method: 'DELETE' })
    mutate()
  }

  const deployVM = async (body: any) => {
    const res = await fetch('/api/compute/vms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    mutate()
    return res.json()
  }

  return {
    vms: data?.vms || [],
    count: data?.count || 0,
    isLoading,
    error,
    startVM,
    stopVM,
    rebootVM,
    deleteVM,
    deployVM,
    mutate,
  }
}

export function useVM(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/compute/vms/${id}` : null,
    fetcher
  )

  return {
    vm: data?.vm as VirtualMachine | undefined,
    isLoading,
    error,
    mutate,
  }
}
