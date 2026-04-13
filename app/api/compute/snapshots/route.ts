import { NextRequest, NextResponse } from 'next/server'
import { cloudstack, pollJob } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const virtualmachineid = searchParams.get('virtualmachineid')

    let params: Record<string, string> = {}
    if (user.role === 'ADMIN') {
      params = { listall: 'true' }
    } else if (user.role === 'RESELLER') {
      params = { domainid: user.domainId, isrecursive: 'true' }
    } else {
      params = { account: user.account, domainid: user.domainId }
    }

    // Filter by VM if provided
    if (virtualmachineid) {
      params.virtualmachineid = virtualmachineid
    }

    const data = await cloudstack('listVMSnapshot', params)
    let snapshots = data.listvmsnapshotresponse?.vmSnapshot || []

    // Ensure snapshots is an array
    if (!Array.isArray(snapshots) && snapshots) {
      snapshots = [snapshots]
    }

    return NextResponse.json({ snapshots, count: snapshots.length })
  } catch (error: any) {
    console.error('[snapshots] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch VM snapshots', details: error?.message, snapshots: [], count: 0 },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { virtualmachineid, name, snapshotmemory } = body

    if (!virtualmachineid) {
      return NextResponse.json(
        { error: 'virtualmachineid is required' },
        { status: 400 }
      )
    }

    const snapshotParams: Record<string, string> = {
      virtualmachineid,
      snapshotmemory: snapshotmemory === false ? 'false' : 'true',
    }
    if (name) snapshotParams.name = name

    const data = await cloudstack('createVMSnapshot', snapshotParams)
    const jobId = data.createvmsnapshotresponse?.jobid
    if (!jobId) {
      return NextResponse.json(
        { error: 'Create VM snapshot did not return a job ID' },
        { status: 500 }
      )
    }

    const result = await pollJob(jobId)
    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error('[snapshots] POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create VM snapshot', details: error?.message },
      { status: 500 }
    )
  }
}
