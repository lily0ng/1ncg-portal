import { NextRequest, NextResponse } from 'next/server'
import { cloudstack } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const virtualmachineid = searchParams.get('virtualmachineid')

    const params: Record<string,string> = {}
    if (user.role === 'ADMIN') params.listall = 'true'
    else { params.account = user.account; params.domainid = user.domainId }

    // Filter by VM if provided
    if (virtualmachineid) {
      params.virtualmachineid = virtualmachineid
    }

    const data = await cloudstack('listBackups', params)
    let backups = data.listbackupsresponse?.backup || []

    // Ensure backups is an array
    if (!Array.isArray(backups) && backups) {
      backups = [backups]
    }

    return NextResponse.json({ backups, count: backups.length })
  } catch (e: any) {
    // Backup API may not be enabled
    console.log('[backups] API error:', e?.message)
    return NextResponse.json({ backups: [], count: 0 })
  }
}
