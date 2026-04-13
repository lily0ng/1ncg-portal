import { NextRequest, NextResponse } from 'next/server'
import { cloudstack, pollJob } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await cloudstack('deleteVMSnapshot', {
      vmsnapshotid: params.id,
    })

    const jobId = data.deletevmsnapshotresponse?.jobid
    if (!jobId) {
      return NextResponse.json(
        { error: 'Delete VM snapshot did not return a job ID' },
        { status: 500 }
      )
    }

    const result = await pollJob(jobId)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[snapshots/[id]] DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete VM snapshot', details: error?.message },
      { status: 500 }
    )
  }
}
