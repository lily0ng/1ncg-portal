import { NextRequest, NextResponse } from 'next/server'
import { cloudstack, pollJob } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await cloudstack('listTemplates', { templatefilter: 'executable', listall: 'true' })
    const templates = data.listtemplatesresponse?.template || []
    return NextResponse.json({ templates, count: templates.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, displaytext, format, url, zoneid, ostypeid, hypervisor } = await req.json()

    const data = await cloudstack('registerTemplate', {
      name,
      displaytext,
      format,
      url,
      zoneid,
      ostypeid,
      hypervisor: hypervisor || 'KVM',
    })
    return NextResponse.json(data.registertemplateresponse?.template?.[0] || data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
