import { NextRequest, NextResponse } from 'next/server'
import { cloudstack, pollJob } from '@/lib/cloudstack'
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

    const data = await cloudstack('listVirtualMachines', { id: params.id })
    const vm = data.listvirtualmachinesresponse?.virtualmachine?.[0]
    if (!vm) {
      return NextResponse.json({ error: 'VM not found' }, { status: 404 })
    }

    return NextResponse.json({ vm })
  } catch (error: any) {
    console.error('[vms/[id]] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch VM', details: error?.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await cloudstack('destroyVirtualMachine', {
      id: params.id,
      expunge: 'false',
    })

    const jobId = data.destroyvirtualmachineresponse?.jobid
    if (!jobId) {
      return NextResponse.json({ error: 'Destroy did not return a job ID' }, { status: 500 })
    }

    const result = await pollJob(jobId)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[vms/[id]] DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to destroy VM', details: error?.message },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const action = body.action as string

    const actionMap: Record<string, string> = {
      start: 'startVirtualMachine',
      stop: 'stopVirtualMachine',
      reboot: 'rebootVirtualMachine',
      restore: 'restoreVirtualMachine',
    }
    const csCommand = actionMap[action]
    if (!csCommand) return NextResponse.json({ error: 'Unknown action' }, { status: 400 })

    const extraParams: Record<string, string> = { id: params.id }
    if (action === 'stop') extraParams.forced = 'false'

    const data = await cloudstack(csCommand, extraParams)
    const responseKey = Object.keys(data)[0]
    const jobId = data[responseKey]?.jobid
    if (!jobId) return NextResponse.json({ success: true, data: data[responseKey] })

    const result = await pollJob(jobId)
    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
