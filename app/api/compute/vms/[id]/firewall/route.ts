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

    // Get VM details to find security group IDs
    const vmData = await cloudstack('listVirtualMachines', { id: vmId })
    const vm = vmData.listvirtualmachinesresponse?.virtualmachine?.[0]

    if (!vm) {
      return NextResponse.json({ error: 'VM not found' }, { status: 404 })
    }

    let rules: any[] = []

    // Try to get security group rules if VM has security groups
    if (vm.securitygroup && Array.isArray(vm.securitygroup)) {
      for (const sg of vm.securitygroup) {
        try {
          const sgData = await cloudstack('listSecurityGroups', { id: sg.id })
          const sgDetails = sgData.listsecuritygroupsresponse?.securitygroup?.[0]

          if (sgDetails) {
            // Ingress rules
            if (sgDetails.ingressrule) {
              const ingressRules = Array.isArray(sgDetails.ingressrule)
                ? sgDetails.ingressrule
                : [sgDetails.ingressrule]
              rules.push(...ingressRules.map((r: any) => ({
                ...r,
                direction: 'Ingress',
                securitygroupname: sgDetails.name,
              })))
            }

            // Egress rules
            if (sgDetails.egressrule) {
              const egressRules = Array.isArray(sgDetails.egressrule)
                ? sgDetails.egressrule
                : [sgDetails.egressrule]
              rules.push(...egressRules.map((r: any) => ({
                ...r,
                direction: 'Egress',
                securitygroupname: sgDetails.name,
              })))
            }
          }
        } catch (e) {
          console.log(`[firewall] Error fetching security group ${sg.id}:`, e)
        }
      }
    }

    // If no security groups, try to get from network firewall
    if (rules.length === 0 && vm.nic) {
      const nics = Array.isArray(vm.nic) ? vm.nic : [vm.nic]

      for (const nic of nics) {
        if (nic.networkid) {
          try {
            const fwData = await cloudstack('listFirewallRules', {
              networkid: nic.networkid,
              listall: 'true'
            })
            const fwRules = fwData.listfirewallrulesresponse?.firewallrule

            if (fwRules) {
              const fwRulesArray = Array.isArray(fwRules) ? fwRules : [fwRules]
              rules.push(...fwRulesArray.map((r: any) => ({
                ...r,
                direction: 'Ingress',
                source: 'Network Firewall',
              })))
            }
          } catch (e) {
            console.log(`[firewall] Error fetching firewall rules for network ${nic.networkid}:`, e)
          }
        }
      }
    }

    return NextResponse.json({
      rules,
      count: rules.length,
      virtualmachineid: vmId
    })
  } catch (error: any) {
    console.error('[firewall] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch firewall rules', details: error?.message, rules: [], count: 0 },
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
    const { protocol, startport, endport, cidrlist, action = 'Allow' } = body

    // Get VM to find security group
    const vmData = await cloudstack('listVirtualMachines', { id: vmId })
    const vm = vmData.listvirtualmachinesresponse?.virtualmachine?.[0]

    if (!vm?.securitygroup?.[0]?.id) {
      return NextResponse.json({ error: 'VM has no security group' }, { status: 400 })
    }

    const securitygroupid = vm.securitygroup[0].id

    // Authorize security group ingress
    const authParams: Record<string, string> = {
      securitygroupid,
      protocol,
      startport: String(startport),
      action,
    }

    if (endport) authParams.endport = String(endport)
    if (cidrlist) authParams.cidrlist = cidrlist

    const data = await cloudstack('authorizeSecurityGroupIngress', authParams)
    const result = data.authorizesecuritygroupingressresponse

    return NextResponse.json({
      success: true,
      rule: result?.securitygroup?.[0]?.ingressrule?.[0] || result,
      message: 'Firewall rule created'
    })
  } catch (error: any) {
    console.error('[firewall] POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create firewall rule', details: error?.message },
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

    // Revoke security group ingress
    const data = await cloudstack('revokeSecurityGroupIngress', { id: ruleId })
    const result = data.revokesecuritygroupingressresponse

    return NextResponse.json({
      success: true,
      message: 'Firewall rule deleted',
      result
    })
  } catch (error: any) {
    console.error('[firewall] DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete firewall rule', details: error?.message },
      { status: 500 }
    )
  }
}
