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

    // First get VM details to extract NIC IDs
    const vmData = await cloudstack('listVirtualMachines', { id: vmId })
    const vm = vmData.listvirtualmachinesresponse?.virtualmachine?.[0]

    if (!vm) {
      return NextResponse.json({ error: 'VM not found' }, { status: 404 })
    }

    // Get NICs from VM data (CloudStack includes nic array in VM details)
    let nics: any[] = []

    if (vm.nic && Array.isArray(vm.nic)) {
      nics = vm.nic
    } else if (vm.nic) {
      // Single NIC case
      nics = [vm.nic]
    }

    // Try to get more detailed NIC info using listNics if available
    try {
      const nicsData = await cloudstack('listNics', { virtualmachineid: vmId })
      const detailedNics = nicsData.listnicsresponse?.nic

      if (detailedNics) {
        if (Array.isArray(detailedNics)) {
          nics = detailedNics
        } else {
          nics = [detailedNics]
        }
      }
    } catch (nicError) {
      // listNics might not be available, use VM nic data
      console.log('[nics] listNics not available, using VM nic data')
    }

    // Enrich NIC data with network names
    const enrichedNics = await Promise.all(
      nics.map(async (nic: any) => {
        if (nic.networkid && !nic.networkname) {
          try {
            const networkData = await cloudstack('listNetworks', { id: nic.networkid })
            const network = networkData.listnetworksresponse?.network?.[0]
            if (network) {
              nic.networkname = network.name
            }
          } catch (e) {
            // Ignore network fetch errors
          }
        }
        return nic
      })
    )

    return NextResponse.json({
      nics: enrichedNics,
      count: enrichedNics.length,
      virtualmachineid: vmId
    })
  } catch (error: any) {
    console.error('[nics] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch NICs', details: error?.message },
      { status: 500 }
    )
  }
}
