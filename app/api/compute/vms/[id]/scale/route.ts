import { NextRequest, NextResponse } from 'next/server'
import { cloudstack, pollJob } from '@/lib/cloudstack'
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
    const { serviceofferingid } = body

    if (!serviceofferingid) {
      return NextResponse.json({ error: 'serviceofferingid is required' }, { status: 400 })
    }

    const data = await cloudstack('scaleVirtualMachine', {
      id: params.id,
      serviceofferingid,
    })

    const responseKey = 'scalevirtualmachineresponse'
    const jobId = data[responseKey]?.jobid

    if (jobId) {
      const result = await pollJob(jobId)
      return NextResponse.json({ success: true, result })
    }

    return NextResponse.json({ success: true, data: data[responseKey] })
  } catch (error: any) {
    console.error('[scale] POST error:', error)
    return NextResponse.json(
      { error: 'Failed to scale VM', details: error?.message },
      { status: 500 }
    )
  }
}
