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

    const vmId = params.id

    // Get port forwarding rules for this VM
    const data = await cloudstack('listPortForwardingRules', {
      virtualmachineid: vmId,
      listall: 'true'
    })

    let rules: any[] = []
    const pfRules = data.listportforwardingrulesresponse?.portforwardingrule

    if (pfRules) {
      if (Array.isArray(pfRules)) {
        rules = pfRules
      } else {
        rules = [pfRules]
      }
    }

    // Get public IPs for this VM to show additional info
    const vmData = await cloudstack('listVirtualMachines', { id: vmId })
    const vm = vmData.listvirtualmachinesresponse?.virtualmachine?.[0]

    // Enrich rules with additional info
    const enrichedRules = await Promise.all(
      rules.map(async (rule: any) => {
        // Get IP address details
        if (rule.ipaddressid && !rule.ipaddress) {
          try {
            const ipData = await cloudstack('listPublicIpAddresses', { id: rule.ipaddressid })
            const ip = ipData.listpublicipaddressesresponse?.publicipaddress?.[0]
            if (ip) {
              rule.ipaddress = ip.ipaddress
            }
          } catch (e) {
            // Ignore
          }
        }
        return rule
      })
    )

    return NextResponse.json({
      rules: enrichedRules,
      count: enrichedRules.length,
      virtualmachineid: vmId,
      publicip: vm?.publicip
    })
  } catch (error: any) {
    console.error('[portforwarding] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch port forwarding rules', details: error?.message, rules: [], count: 0 },
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
    const {
      ipaddressid,
      publicport,
      privateport,
      protocol = 'TCP',
      publicendport,
      privateendport,
      openfirewall = true
    } = body

    if (!ipaddressid || !publicport || !privateport) {
      return NextResponse.json({
        error: 'ipaddressid, publicport, and privateport are required'
      }, { status: 400 })
    }

    // Create port forwarding rule
    const pfParams: Record<string, string> = {
      ipaddressid,
      virtualmachineid: vmId,
      publicport: String(publicport),
      privateport: String(privateport),
      protocol: protocol.toUpperCase(),
    }

    if (publicendport) pfParams.publicendport = String(publicendport)
    if (privateendport) pfParams.privateendport = String(privateendport)
    if (openfirewall) pfParams.openfirewall = 'true'

    const data = await cloudstack('createPortForwardingRule', pfParams)
    const result = data.createportforwardingruleresponse

    const jobId = result?.jobid
    if (jobId) {
      const jobResult = await pollJob(jobId)
      return NextResponse.json({
        success: true,
        rule: jobResult,
        message: 'Port forwarding rule created'
      })
    }

    return NextResponse.json({
      success: true,
      rule: result,
      message: 'Port forwarding rule created'
    })
  } catch (error: any) {
    console.error('[portforwarding] POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create port forwarding rule', details: error?.message },
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

    const { searchParams } = new URL(req.url)
    const ruleId = searchParams.get('ruleId')

    if (!ruleId) {
      return NextResponse.json({ error: 'ruleId is required' }, { status: 400 })
    }

    // Delete port forwarding rule
    const data = await cloudstack('deletePortForwardingRule', { id: ruleId })
    const result = data.deleteportforwardingruleresponse

    const jobId = result?.jobid
    if (jobId) {
      await pollJob(jobId)
    }

    return NextResponse.json({
      success: true,
      message: 'Port forwarding rule deleted',
      result
    })
  } catch (error: any) {
    console.error('[portforwarding] DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete port forwarding rule', details: error?.message },
      { status: 500 }
    )
  }
}
