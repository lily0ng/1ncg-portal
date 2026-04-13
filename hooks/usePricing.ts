import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export interface PricingPlan {
  id: string
  name: string
  description?: string | null
  currency: string
  vcpuPrice: number
  ramGbPrice: number
  storageGbPrice: number
  ipPrice: number
  bandwidthGbPrice: number
  snapshotGbPrice: number
  lbPrice: number
  k8sNodePrice: number
  minMonthlyFee: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export function usePricing() {
  const { data, error, isLoading, mutate } = useSWR<PricingPlan[]>('/api/pricing/plans', fetcher)

  const createPlan = async (body: Partial<PricingPlan>) => {
    const res = await fetch('/api/pricing/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to create plan')
    }
    await mutate()
    return res.json() as Promise<PricingPlan>
  }

  const updatePlan = async (id: string, body: Partial<PricingPlan>) => {
    const res = await fetch(`/api/pricing/plans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to update plan')
    }
    await mutate()
    return res.json() as Promise<PricingPlan>
  }

  const deletePlan = async (id: string) => {
    const res = await fetch(`/api/pricing/plans/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to delete plan')
    }
    await mutate()
    return res.json()
  }

  return {
    plans: data || [],
    isLoading,
    error,
    mutate,
    createPlan,
    updatePlan,
    deletePlan
  }
}
