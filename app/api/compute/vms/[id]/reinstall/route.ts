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
    const { templateid } = body

    if (!templateid) {
      return NextResponse.json({ error: 'templateid is required' }, { status: 400 })
    }

    const data = await cloudstack('restoreVirtualMachine', {
      virtualmachineid: params.id,
      templateid,
    })

    const responseKey = 'restorevirtualmachineresponse'
    const jobId = data[responseKey]?.jobid

    if (jobId) {
      const result = await pollJob(jobId)
      return NextResponse.json({ success: true, result })
    }

    return NextResponse.json({ success: true, data: data[responseKey] })
  } catch (error: any) {
    console.error('[reinstall] POST error:', error)
    return NextResponse.json(
      { error: 'Failed to reinstall VM', details: error?.message },
      { status: 500 }
    )
  }
}
