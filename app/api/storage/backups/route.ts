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
    const data = await cloudstack('listBackups', params)
    const backups = data.listbackupsresponse?.backup || []
    return NextResponse.json({ backups, count: backups.length })
  } catch (e: any) {
    // Backup API may not be enabled
    return NextResponse.json({ backups: [], count: 0 })
  }
}
