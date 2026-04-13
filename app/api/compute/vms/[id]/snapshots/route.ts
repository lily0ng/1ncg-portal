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

    const vmId = params.id

    // Get VM snapshots using listVMSnapshots
    const data = await cloudstack('listVMSnapshots', { virtualmachineid: vmId })
    let snapshots: any[] = []

    const vmSnapshots = data.listvmsnapshotsresponse?.vmsnapshot

    if (vmSnapshots) {
      if (Array.isArray(vmSnapshots)) {
        snapshots = vmSnapshots
      } else {
        snapshots = [vmSnapshots]
      }
    }

    // Format snapshots for display
    const formattedSnapshots = snapshots.map((snap: any) => ({
      id: snap.id,
      name: snap.displayname || snap.name || `Snapshot-${snap.id?.slice(0, 8)}`,
      description: snap.description || '',
      state: snap.state || 'Unknown',
      type: snap.type || 'DiskAndMemory',
      current: snap.current === 'true',
      parent: snap.parent,
      created: snap.created,
      updated: snap.updated,
      domain: snap.domain,
      domainid: snap.domainid,
      account: snap.account,
      virtualmachineid: snap.virtualmachineid,
    }))

    return NextResponse.json({
      snapshots: formattedSnapshots,
      count: formattedSnapshots.length,
      virtualmachineid: vmId
    })
  } catch (error: any) {
    console.error('[vm-snapshots] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch VM snapshots', details: error?.message, snapshots: [], count: 0 },
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
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const vmId = params.id
    const body = await req.json()
    const { name, description, snapshotmemory } = body

    // Create VM snapshot
    const data = await cloudstack('createVMSnapshot', {
      virtualmachineid: vmId,
      name: name || `vm-snapshot-${Date.now()}`,
      description: description || '',
      snapshotmemory: snapshotmemory ? 'true' : 'false',
    })

    const result = data.createvmsnapshotresponse

    if (result?.jobid) {
      return NextResponse.json({
        success: true,
        jobid: result.jobid,
        message: 'VM snapshot creation initiated'
      })
    }

    return NextResponse.json({
      success: true,
      snapshot: result
    })
  } catch (error: any) {
    console.error('[vm-snapshots] POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create VM snapshot', details: error?.message },
      { status: 500 }
    )
  }
}
