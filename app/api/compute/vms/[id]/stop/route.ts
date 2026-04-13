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

    const data = await cloudstack('stopVirtualMachine', {
      id: params.id,
      forced: 'false',
    })

    const jobId = data.stopvirtualmachineresponse?.jobid
    if (!jobId) {
      return NextResponse.json({ error: 'Stop did not return a job ID' }, { status: 500 })
    }

    const result = await pollJob(jobId)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[vms/[id]/stop] POST error:', error)
    return NextResponse.json(
      { error: 'Failed to stop VM', details: error?.message },
      { status: 500 }
    )
  }
}
