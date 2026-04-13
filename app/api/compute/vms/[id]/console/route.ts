import { NextRequest, NextResponse } from 'next/server'
import { cloudstack } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await cloudstack('createConsoleEndpoint', {
      virtualmachineid: params.id,
    })

    return NextResponse.json({
      url: data.createconsoleendpointresponse?.url,
    })
  } catch (error: any) {
    console.error('[vms/[id]/console] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to create console endpoint', details: error?.message },
      { status: 500 }
    )
  }
}
