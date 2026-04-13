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

    // Get VM autoscale groups (if any)
    let schedules: any[] = []

    // Try to get autoscale vm groups
    try {
      const asData = await cloudstack('listAutoScaleVmGroups', { vmid: vmId })
      const asGroups = asData.listautoscalevmgroupsresponse?.autoscalevmgroup

      if (asGroups) {
        if (Array.isArray(asGroups)) {
          schedules = asGroups.map((group: any) => ({
            id: group.id,
            action: 'AUTOSCALE',
            state: group.state,
            description: `Autoscale: ${group.minmembers || 0} - ${group.maxmembers || 0} VMs`,
            schedule: group.scaleuppolicy?.[0]?.duration || '-',
            timezone: group.scaleuppolicy?.[0]?.quiettime || '-',
            created: group.created,
          }))
        }
      }
    } catch (e) {
      console.log('[schedules] AutoScale not available')
    }

    // Get VM snapshot schedules
    try {
      const snapSchedules = await cloudstack('listVmSnapshotSchedules', { virtualmachineid: vmId })
      const vmSnapScheds = snapSchedules.listvmsnapshotschedulesresponse?.vmsnapshotschedule

      if (vmSnapScheds) {
        const snapSchedArray = Array.isArray(vmSnapScheds) ? vmSnapScheds : [vmSnapScheds]
        schedules.push(...snapSchedArray.map((sched: any) => ({
          id: sched.id,
          action: 'SNAPSHOT',
          state: sched.enabled === 'true' ? 'Enabled' : 'Disabled',
          description: `VM Snapshot: ${sched.type}`,
          schedule: sched.schedule,
          timezone: sched.timezone || 'UTC',
          startdate: sched.created,
        })))
      }
    } catch (e) {
      console.log('[schedules] VM Snapshot schedules not available')
    }

    // Get snapshot schedules (volume)
    try {
      const volSchedules = await cloudstack('listSnapshotSchedules', { virtualmachineid: vmId })
      const volSnapScheds = volSchedules.listsnapshotschedulesresponse?.snapshotschedule

      if (volSnapScheds) {
        const volSchedArray = Array.isArray(volSnapScheds) ? volSnapScheds : [volSnapScheds]
        schedules.push(...volSchedArray.map((sched: any) => ({
          id: sched.id,
          action: 'VOLUME_SNAPSHOT',
          state: sched.enabled === 'true' ? 'Enabled' : 'Disabled',
          description: `Volume Snapshot: ${sched.volumeid?.slice(0, 8)}...`,
          schedule: sched.schedule,
          timezone: sched.timezone || 'UTC',
          startdate: sched.created,
        })))
      }
    } catch (e) {
      console.log('[schedules] Volume snapshot schedules not available')
    }

    return NextResponse.json({
      schedules,
      count: schedules.length,
      virtualmachineid: vmId
    })
  } catch (error: any) {
    console.error('[schedules] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedules', details: error?.message, schedules: [], count: 0 },
      { status: 500 }
    )
  }
}
