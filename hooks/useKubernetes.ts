import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useKubernetes() {
  const { data, error, isLoading, mutate } = useSWR('/api/compute/kubernetes', fetcher)

  const createCluster = async (body: {
    name: string
    zoneid: string
    serviceofferingid: string
    templateid?: string
    size?: number
    noderootdisksize?: number
    keypair?: string
    networkid?: string
    [key: string]: any
  }) => {
    const res = await fetch('/api/compute/kubernetes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to create cluster')
    }
    await mutate()
    return res.json()
  }

  const deleteCluster = async (id: string) => {
    const res = await fetch(`/api/compute/kubernetes/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to delete cluster')
    }
    await mutate()
    return res.json()
  }

  const getConfig = async (id: string): Promise<string> => {
    const res = await fetch(`/api/compute/kubernetes/${id}/config`)
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to get kubeconfig')
    }
    const data = await res.json()
    return data.configdata || data.kubeconfig || data
  }

  return {
    clusters: data || [],
    isLoading,
    error,
    mutate,
    createCluster,
    deleteCluster,
    getConfig
  }
}
