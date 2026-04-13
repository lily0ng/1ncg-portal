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

    // Fetch VM details and volume info in parallel
    const [vmData, volumeData] = await Promise.all([
      cloudstack('listVirtualMachines', { id: params.id }),
      cloudstack('listVolumes', { virtualmachineid: params.id }),
    ])

    const vm = vmData.listvirtualmachinesresponse?.virtualmachine?.[0]
    if (!vm) {
      return NextResponse.json({ error: 'VM not found' }, { status: 404 })
    }

    const volumes = volumeData.listvolumesresponse?.volume || []

    // Parse CPU usage — CloudStack returns a string like "10.5%"
    const cpuRaw = vm.cpuused ?? '0%'
    const cpu = parseFloat(String(cpuRaw).replace('%', '')) || 0

    // Memory: CloudStack returns memory in MiB
    const memoryTotal = vm.memory ?? 0 // MiB
    const memoryUsed = vm.memorykbs != null ? Math.round(vm.memorykbs / 1024) : 0 // kB → MiB

    // Network I/O in KiB/s (raw counters from CloudStack)
    const networkRx = vm.networkkbsread ?? 0
    const networkTx = vm.networkkbswrite ?? 0

    // Disk I/O in KiB/s
    const diskRead = vm.diskkbsread ?? 0
    const diskWrite = vm.diskkbswrite ?? 0

    return NextResponse.json({
      cpu,
      memory: {
        used: memoryUsed,   // MiB
        total: memoryTotal, // MiB
      },
      network: {
        rx: networkRx, // KiB/s
        tx: networkTx, // KiB/s
      },
      disk: {
        read: diskRead,   // KiB/s
        write: diskWrite, // KiB/s
      },
      volumes,
    })
  } catch (error: any) {
    console.error('[vms/[id]/metrics] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch VM metrics', details: error?.message },
      { status: 500 }
    )
  }
}
