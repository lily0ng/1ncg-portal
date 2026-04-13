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

    // Get VM details to extract resource details/settings
    const vmData = await cloudstack('listVirtualMachines', { id: vmId })
    const vm = vmData.listvirtualmachinesresponse?.virtualmachine?.[0]

    if (!vm) {
      return NextResponse.json({ error: 'VM not found' }, { status: 404 })
    }

    // Build settings array from VM details
    const settings = [
      { name: 'haenable', value: vm.haenable ? 'true' : 'false', description: 'High Availability enabled' },
      { name: 'isdynamicallyscalable', value: vm.isdynamicallyscalable ? 'true' : 'false', description: 'Dynamic scaling enabled' },
      { name: 'passwordenabled', value: vm.passwordenabled ? 'true' : 'false', description: 'Password authentication enabled' },
      { name: 'keypair', value: vm.keypair || '-', description: 'SSH Key Pair' },
      { name: 'group', value: vm.group || '-', description: 'Instance Group' },
      { name: 'affinitygroup', value: vm.affinitygroup?.map((ag: any) => ag.name).join(', ') || '-', description: 'Affinity Groups' },
      { name: 'securitygroup', value: vm.securitygroup?.map((sg: any) => sg.name).join(', ') || '-', description: 'Security Groups' },
      { name: 'hypervisor', value: vm.hypervisor, description: 'Hypervisor Type' },
      { name: 'templatedisplaytext', value: vm.templatedisplaytext || '-', description: 'Template Display Name' },
    ]

    return NextResponse.json({ settings, count: settings.length })
  } catch (error: any) {
    console.error('[settings] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings', settings: [], count: 0 },
      { status: 500 }
    )
  }
}
