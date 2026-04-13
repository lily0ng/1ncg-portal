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

    const data = await cloudstack('rebootVirtualMachine', { id: params.id })
    const jobId = data.rebootvirtualmachineresponse?.jobid
    if (!jobId) {
      return NextResponse.json({ error: 'Reboot did not return a job ID' }, { status: 500 })
    }

    const result = await pollJob(jobId)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[vms/[id]/reboot] POST error:', error)
    return NextResponse.json(
      { error: 'Failed to reboot VM', details: error?.message },
      { status: 500 }
    )
  }
}
