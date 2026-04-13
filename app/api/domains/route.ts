import { NextRequest, NextResponse } from 'next/server'
import { cloudstack, pollJob } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await cloudstack('listDomains', { listall: 'true' })
    const domains = data.listdomainsresponse?.domain || []
    return NextResponse.json({ domains, count: domains.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, parentdomainid } = await req.json()

    const params: Record<string, string> = { name }
    if (parentdomainid) params.parentdomainid = parentdomainid

    const data = await cloudstack('createDomain', params)
    return NextResponse.json(data.createdomainresponse?.domain || data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
