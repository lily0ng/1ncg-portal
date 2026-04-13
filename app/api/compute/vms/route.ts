import { NextRequest, NextResponse } from 'next/server'
import { cloudstack, pollJob } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let params: Record<string, string> = {}
    if (user.role === 'ADMIN') {
      params = { listall: 'true' }
    } else if (user.role === 'RESELLER') {
      params = { domainid: user.domainId, isrecursive: 'true' }
    } else {
      params = { account: user.account, domainid: user.domainId }
    }

    const data = await cloudstack('listVirtualMachines', params)
    const vms = data.listvirtualmachinesresponse?.virtualmachine || []
    return NextResponse.json({ vms, count: vms.length })
  } catch (error: any) {
    console.error('[vms] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch VMs', details: error?.message },
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
    const { serviceofferingid, templateid, zoneid, displayname, networkids } = body

    if (!serviceofferingid || !templateid || !zoneid) {
      return NextResponse.json(
        { error: 'serviceofferingid, templateid, and zoneid are required' },
        { status: 400 }
      )
    }

    const deployParams: Record<string, string> = {
      serviceofferingid,
      templateid,
      zoneid,
    }
    if (displayname) deployParams.displayname = displayname
    if (networkids) deployParams.networkids = networkids

    // Scope to the user's account unless ADMIN deploying globally
    if (user.role !== 'ADMIN') {
      deployParams.account = user.account
      deployParams.domainid = user.domainId
    }

    const data = await cloudstack('deployVirtualMachine', deployParams)
    const jobId = data.deployvirtualmachineresponse?.jobid
    if (!jobId) {
      return NextResponse.json({ error: 'Deploy did not return a job ID' }, { status: 500 })
    }

    const result = await pollJob(jobId)
    return NextResponse.json(result.virtualmachine ?? result, { status: 201 })
  } catch (error: any) {
    console.error('[vms] POST error:', error)
    return NextResponse.json(
      { error: 'Failed to deploy VM', details: error?.message },
      { status: 500 }
    )
  }
}
