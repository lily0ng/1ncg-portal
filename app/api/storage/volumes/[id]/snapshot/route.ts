import { NextRequest, NextResponse } from 'next/server'
import { cloudstack } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const data = await cloudstack('createSnapshot', { volumeid: params.id })
    return NextResponse.json({ snapshot: data.createsnapshotresponse })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
