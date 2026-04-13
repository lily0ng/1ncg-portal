import { NextRequest, NextResponse } from 'next/server'
import { cloudstack, pollJob } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [gatewaysData, remoteAccessData] = await Promise.all([
      cloudstack('listVpnGateways', { listall: 'true' }),
      cloudstack('listRemoteAccessVpns', { listall: 'true' }),
    ])

    return NextResponse.json({
      gateways: gatewaysData.listvpngatewaysresponse?.vpngateway || [],
      remoteAccess: remoteAccessData.listremoteaccessvpnsresponse?.remoteaccessvpn || [],
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { publicipid } = await req.json()

    const data = await cloudstack('createRemoteAccessVpn', { publicipid })
    const jobId = data.createremoteaccessvpnresponse?.jobid
    const result = await pollJob(jobId)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
