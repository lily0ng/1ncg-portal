import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export interface Reseller {
  id: string
  csAccountId: string
  name: string
  email: string
  domainId: string
  commission: number
  markupPct: number
  active: boolean
  customerCount?: number
  createdAt: string
  updatedAt: string
}

export function useResellers() {
  const { data, error, isLoading, mutate } = useSWR<Reseller[]>('/api/resellers', fetcher)

  const createReseller = async (body: {
    name: string
    email: string
    domainid?: string
    commission?: number
    markupPct?: number
  }) => {
    const res = await fetch('/api/resellers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to create reseller')
    }
    await mutate()
    return res.json() as Promise<Reseller>
  }

  const deleteReseller = async (id: string) => {
    const res = await fetch(`/api/resellers/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to delete reseller')
    }
    await mutate()
    return res.json()
  }

  return {
    resellers: data || [],
    isLoading,
    error,
    mutate,
    createReseller,
    deleteReseller
  }
}
