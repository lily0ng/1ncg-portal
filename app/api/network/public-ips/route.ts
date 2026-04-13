import { NextRequest, NextResponse } from 'next/server'
import { cloudstack, pollJob } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await cloudstack('listPublicIpAddresses', { allocatedonly: 'true', listall: 'true' })
    const ips = data.listpublicipaddressesresponse?.publicipaddress || []
    return NextResponse.json({ ips, count: ips.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { zoneid, vpcid, networkid } = await req.json()

    const params: Record<string, string> = { zoneid }
    if (vpcid) params.vpcid = vpcid
    if (networkid) params.networkid = networkid

    const data = await cloudstack('associateIpAddress', params)
    const jobId = data.associateipaddressresponse?.jobid
    const result = await pollJob(jobId)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
