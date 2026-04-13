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
    const data = await cloudstack('listVnfAppliances', params)
    const appliances = data.listvnfappliancesresponse?.vnfappliance || []
    return NextResponse.json({ appliances, count: appliances.length })
  } catch (e: any) {
    // VNF not enabled in all CloudStack setups — return empty
    return NextResponse.json({ appliances: [], count: 0 })
  }
}
