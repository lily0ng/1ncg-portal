import { NextRequest, NextResponse } from 'next/server'
import { cloudstack } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const params: Record<string,string> = {}
    if (user.role === 'ADMIN') params.listall = 'true'
    else { params.account = user.account; params.domainid = user.domainId }
    const data = await cloudstack('listAutoScaleVmGroups', params)
    const groups = data.listautoscalevmgroupsresponse?.autoscalevmgroup || []
    return NextResponse.json({ groups, count: groups.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const data = await cloudstack('createAutoScaleVmGroup', {
      lbruleid: body.lbruleid,
      minmembers: String(body.minmembers || 1),
      maxmembers: String(body.maxmembers || 5),
      scaleuppolicies: body.scaleuppolicies,
      scaledownpolicies: body.scaledownpolicies,
    })
    return NextResponse.json({ group: data.createautoscalevmgroupresponse })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
