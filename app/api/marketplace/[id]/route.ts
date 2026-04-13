import { NextRequest, NextResponse } from 'next/server'
import { cloudstack, pollJob } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'
import { db } from '@/lib/db'

interface Params { params: { id: string } }

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const app = await db.marketplaceApp.findUnique({ where: { id: params.id } })
    if (!app) return NextResponse.json({ error: 'App not found' }, { status: 404 })

    return NextResponse.json(app)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const app = await db.marketplaceApp.findUnique({ where: { id: params.id } })
    if (!app) return NextResponse.json({ error: 'App not found' }, { status: 404 })

    const { zoneid, networkid, displayname } = await req.json()

    const rawParams: Record<string, string | undefined> = {
      templateid: app.templateId ?? undefined,
      serviceofferingid: app.offeringId ?? undefined,
      zoneid,
      networkid: networkid || (app as any).networkId || '',
      displayname: displayname || app.name,
      ...((app.deployParams as Record<string, string>) || {})
    }

    // Remove undefined / null / empty values
    const deployParams: Record<string, string> = Object.fromEntries(
      Object.entries(rawParams).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ) as Record<string, string>

    // Scope to account if not ADMIN
    if (user.role !== 'ADMIN') {
      deployParams.account = user.account
      deployParams.domainid = user.domainId
    }

    const data = await cloudstack('deployVirtualMachine', deployParams)
    const jobId = data.deployvirtualmachineresponse?.jobid
    if (!jobId) return NextResponse.json({ error: 'Deploy did not return a job ID' }, { status: 500 })

    const result = await pollJob(jobId)
    return NextResponse.json(result.virtualmachine ?? result, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser(req)
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await db.marketplaceApp.update({
      where: { id: params.id },
      data: { active: false }
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
