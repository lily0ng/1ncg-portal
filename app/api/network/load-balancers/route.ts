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
    const data = await cloudstack('listLoadBalancerRules', params)
    const loadbalancers = data.listloadbalancerrulesresponse?.loadbalancerrule || []
    return NextResponse.json({ loadbalancers, count: loadbalancers.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const data = await cloudstack('createLoadBalancerRule', {
      name: body.name,
      publicipid: body.publicipid,
      publicport: String(body.publicport),
      privateport: String(body.privateport),
      algorithm: body.algorithm || 'roundrobin',
    })
    return NextResponse.json({ loadbalancer: data.createloadbalancerruleresponse })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
