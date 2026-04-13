import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useVPC() {
  const { data, error, isLoading, mutate } = useSWR('/api/network/vpc', fetcher)

  const createVPC = async (body: {
    name: string
    displaytext: string
    cidr: string
    zoneid: string
    vpcofferingid: string
    [key: string]: any
  }) => {
    const res = await fetch('/api/network/vpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to create VPC')
    }
    await mutate()
    return res.json()
  }

  const deleteVPC = async (id: string) => {
    const res = await fetch(`/api/network/vpc/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to delete VPC')
    }
    await mutate()
    return res.json()
  }

  return {
    vpcs: data || [],
    isLoading,
    error,
    mutate,
    createVPC,
    deleteVPC
  }
}
