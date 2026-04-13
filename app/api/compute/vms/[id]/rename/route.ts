import { NextRequest, NextResponse } from 'next/server'
import { cloudstack } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { displayname } = body

    if (!displayname) {
      return NextResponse.json({ error: 'displayname is required' }, { status: 400 })
    }

    const data = await cloudstack('updateVirtualMachine', {
      id: params.id,
      displayname,
    })

    const vm = data.updatevirtualmachineresponse?.virtualmachine

    return NextResponse.json({ success: true, vm })
  } catch (error: any) {
    console.error('[rename] POST error:', error)
    return NextResponse.json(
      { error: 'Failed to rename VM', details: error?.message },
      { status: 500 }
    )
  }
}
