import { NextRequest, NextResponse } from 'next/server'
import { cloudstack } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

const PRICING: Record<number, number> = {
  1: 0.05,   // Running VMs per hour
  2: 0.01,   // Allocated VMs per hour
  5: 0.004,  // Public IPs per hour
  6: 0.10,   // Storage GB per month
  7: 0.02,   // Snapshot GB
  8: 0.10,   // Template/ISO GB
  11: 0.01,  // Load balancer per hour
  14: 0.005, // VPN users per hour
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const now = new Date()
    const start = searchParams.get('start') ||
      `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`
    const end = searchParams.get('end') || now.toISOString().split('T')[0]

    const params: Record<string, string> = { startdate: start, enddate: end, pagesize: '1000' }
    if (user.role !== 'ADMIN') {
      params.account = user.account
      params.domainid = user.domainId
    }

    let records: any[] = []
    try {
      const data = await cloudstack('listUsageRecords', params)
      records = data.listusagerecordsresponse?.usagerecord || []
    } catch (csErr: any) {
      // Usage Service may not be enabled — return empty data instead of failing
      console.warn('[billing/usage] CloudStack usage unavailable:', csErr?.message || csErr)
    }

    const summary = records.reduce((acc: any, r: any) => {
      const cost = (parseFloat(r.rawusage) || 0) * (PRICING[r.usagetype] || 0)
      acc.total = (acc.total || 0) + cost
      acc.byType = acc.byType || {}
      acc.byType[r.usagetype] = (acc.byType[r.usagetype] || 0) + cost
      acc.byAccount = acc.byAccount || {}
      acc.byAccount[r.account] = (acc.byAccount[r.account] || 0) + cost
      return acc
    }, { total: 0, byType: {}, byAccount: {} })

    return NextResponse.json({ records, summary, period: { start, end } })
  } catch (error: any) {
    console.error('[billing/usage] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 })
  }
}
