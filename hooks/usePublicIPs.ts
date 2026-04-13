import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function usePublicIPs() {
  const { data, error, isLoading, mutate } = useSWR('/api/network/public-ips', fetcher)

  const allocate = async (body: {
    zoneid: string
    networkid?: string
    vpcid?: string
    [key: string]: any
  }) => {
    const res = await fetch('/api/network/public-ips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to allocate IP')
    }
    await mutate()
    return res.json()
  }

  const release = async (id: string) => {
    const res = await fetch(`/api/network/public-ips/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to release IP')
    }
    await mutate()
    return res.json()
  }

  const enableStaticNAT = async (id: string, body: { virtualmachineid: string; vmguestip?: string }) => {
    const res = await fetch(`/api/network/public-ips/${id}/associate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to enable static NAT')
    }
    await mutate()
    return res.json()
  }

  return {
    publicIPs: data || [],
    isLoading,
    error,
    mutate,
    allocate,
    release,
    enableStaticNAT
  }
}
