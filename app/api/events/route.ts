import { NextRequest, NextResponse } from 'next/server'
import { cloudstack, pollJob } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const page = searchParams.get('page') || '1'
    const pagesize = searchParams.get('pagesize') || '50'
    const resourceid = searchParams.get('resourceid')
    const type = searchParams.get('type')

    const params: Record<string, string> = { page, pagesize }
    if (resourceid) params.resourceid = resourceid
    if (type) params.type = type

    const data = await cloudstack('listEvents', params)
    const events = data.listeventsresponse?.event || []
    return NextResponse.json({ events, count: events.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
