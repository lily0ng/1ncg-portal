import { NextRequest, NextResponse } from 'next/server'
import { cloudstack, pollJob } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await cloudstack('listIsos', { isofilter: 'executable', listall: 'true' })
    const isos = data.listisosresponse?.iso || []
    return NextResponse.json({ isos, count: isos.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, displaytext, url, zoneid, ostypeid, bootable } = await req.json()

    const params: Record<string, string> = { name, displaytext, url, zoneid, ostypeid }
    if (bootable !== undefined) params.bootable = String(bootable)

    const data = await cloudstack('registerIso', params)
    return NextResponse.json(data.registerisoresponse?.iso?.[0] || data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
