import { NextRequest, NextResponse } from 'next/server'
import { cloudstack } from '@/lib/cloudstack'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const logs = await db.syncLog.findMany({ orderBy: { syncedAt: 'desc' }, take: 10 })
    const lastSync = logs[0] || null
    return NextResponse.json({ logs, lastSync })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const start = Date.now()
    const [zones, vms, volumes, networks, hosts, offerings] = await Promise.all([
      cloudstack('listZones', { available: 'true' }),
      cloudstack('listVirtualMachines', { listall: 'true' }),
      cloudstack('listVolumes', { listall: 'true' }),
      cloudstack('listNetworks', { listall: 'true' }),
      cloudstack('listHosts', { type: 'Routing' }),
      cloudstack('listServiceOfferings', { issystem: 'false' }),
    ])

    const vmCount = vms.listvirtualmachinesresponse?.count || 0
    const volumeCount = volumes.listvolumesresponse?.count || 0
    const netCount = networks.listnetworksresponse?.count || 0
    const hostCount = hosts.listhostsresponse?.count || 0
    const duration = Date.now() - start

    await db.syncLog.create({
      data: { syncedAt: new Date(), vmCount, volumeCount, netCount, hostCount, status: 'success', duration }
    })

    return NextResponse.json({
      success: true,
      syncedAt: new Date().toISOString(),
      duration,
      counts: {
        vms: vmCount, volumes: volumeCount, networks: netCount, hosts: hostCount,
        zones: zones.listzonesresponse?.count || 0,
        offerings: offerings.listserviceofferingsresponse?.count || 0,
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'Sync failed', details: error.message }, { status: 500 })
  }
}
