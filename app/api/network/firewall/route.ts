import { NextRequest, NextResponse } from 'next/server'
import { cloudstack, pollJob } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await cloudstack('listFirewallRules', { listall: 'true' })
    return NextResponse.json(data.listfirewallrulesresponse?.firewallrule || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { ipaddressid, protocol, startport, endport, cidrlist } = await req.json()

    const data = await cloudstack('createFirewallRule', {
      ipaddressid,
      protocol,
      startport: String(startport),
      endport: String(endport),
      cidrlist,
    })
    return NextResponse.json(data.createfirewallruleresponse || data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
