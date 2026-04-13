export interface InvoiceItem {
  description: string
  usageType: string
  usage: number
  rate: number
  cost: number
  resourceId?: string
  resourceName?: string
}

export interface Invoice {
  id: string
  userId: string
  amount: number
  month: string
  status: 'UNPAID' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  items: InvoiceItem[]
  createdAt: string
  paidAt?: string
}

export interface PricingPlan {
  id: string
  name: string
  vmPriceHr: number
  ipPriceHr: number
  storagePriceGb: number
  active: boolean
  createdAt: string
}

export interface Payment {
  id: string
  userId: string
  invoiceId?: string
  amount: number
  method: 'credit_card' | 'paypal' | 'bank_transfer' | 'crypto'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  transactionId?: string
  createdAt: string
}

export interface Credit {
  id: string
  userId: string
  amount: number
  balance: number
  type: 'purchase' | 'refund' | 'bonus' | 'adjustment'
  description?: string
  createdAt: string
}

export interface UsageBreakdown {
  period: {
    start: string
    end: string
  }
  total: number
  byType: Array<{
    type: number
    name: string
    usage: number
    cost: number
  }>
  byResource: Array<{
    resourceId: string
    resourceName: string
    resourceType: string
    cost: number
  }>
}

export const USAGE_TYPE_NAMES: Record<number, string> = {
  1: 'Running VM',
  2: 'Allocated VM',
  3: 'Public IP Address',
  4: 'Template',
  5: 'Volume',
  6: 'ISO',
  7: 'Snapshot',
  8: 'Backup',
  9: 'Load Balancer',
  10: 'Port Forwarding',
  11: 'Network Rule',
  12: 'VPN Gateway',
  13: 'VPN Connection',
  14: 'VPN User',
  15: 'Data Transfer',
  16: 'DNS Domain',
  17: 'CPU',
  18: 'Memory',
  19: 'Network Bytes Received',
  20: 'Network Bytes Sent',
}

export const PRICING: Record<number, number> = {
  1: 0.05,   // Running VM/hr
  2: 0.01,   // Allocated VM/hr
  3: 0.004,  // Public IP/hr
  4: 0.05,   // Template
  5: 0.10,   // Volume GB/month
  6: 0.05,   // ISO
  7: 0.02,   // Snapshot
  8: 0.02,   // Backup
  9: 0.01,   // LB rule/hr
  11: 0.01,  // Network rule/hr
  14: 0.005, // VPN user/hr
}
