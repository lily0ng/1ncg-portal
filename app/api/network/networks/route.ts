import { NextRequest, NextResponse } from 'next/server'
import { cloudstack, pollJob } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let params: Record<string, string> = {}

    if (user.role === 'ADMIN') {
      params = { listall: 'true' }
    } else if (user.role === 'RESELLER') {
      params = { domainid: user.domainId, isrecursive: 'true' }
    } else {
      params = { account: user.account, domainid: user.domainId }
    }

    const data = await cloudstack('listNetworks', params)
    const networks = data.listnetworksresponse?.network || []
    return NextResponse.json({ networks, count: networks.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, networkofferingid, zoneid, displaytext, gateway, netmask, vpcid } = await req.json()

    const params: Record<string, string> = { name, networkofferingid, zoneid, displaytext, gateway, netmask }
    if (vpcid) params.vpcid = vpcid

    const data = await cloudstack('createNetwork', params)
    const jobId = data.createnetworkresponse?.jobid
    const result = await pollJob(jobId)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
