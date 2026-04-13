import { NextRequest, NextResponse } from 'next/server'
import { cloudstack } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let params: Record<string, string> = {}
    if (user.role === 'ADMIN') {
      params = { listall: 'true' }
    } else if (user.role === 'RESELLER') {
      params = { domainid: user.domainId, isrecursive: 'true' }
    } else {
      params = { account: user.account, domainid: user.domainId }
    }

    const data = await cloudstack('listAutoScaleVmGroups', params)
    return NextResponse.json(
      data.listautoscalevmgroupsresponse?.autoscalevmgroup || []
    )
  } catch (error: any) {
    console.error('[autoscaling] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch autoscale VM groups', details: error?.message },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    if (!body.lbruleid || !body.vmprofileid || !body.minmembers || !body.maxmembers) {
      return NextResponse.json(
        { error: 'lbruleid, vmprofileid, minmembers, and maxmembers are required' },
        { status: 400 }
      )
    }

    const groupParams: Record<string, string> = {
      lbruleid: body.lbruleid,
      vmprofileid: body.vmprofileid,
      minmembers: String(body.minmembers),
      maxmembers: String(body.maxmembers),
    }

    if (body.interval) groupParams.interval = String(body.interval)
    if (body.scaledownpolicies) groupParams.scaledownpolicies = body.scaledownpolicies
    if (body.scaleuppolicies) groupParams.scaleuppolicies = body.scaleuppolicies

    const data = await cloudstack('createAutoScaleVmGroup', groupParams)
    return NextResponse.json(
      data.createautoscalevmgroupresponse?.autoscalevmgroup ?? data,
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[autoscaling] POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create autoscale VM group', details: error?.message },
      { status: 500 }
    )
  }
}
