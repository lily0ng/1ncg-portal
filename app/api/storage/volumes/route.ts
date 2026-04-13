import { NextRequest, NextResponse } from 'next/server'
import { cloudstack, pollJob } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const virtualmachineid = searchParams.get('virtualmachineid')

    let params: Record<string, string> = {}

    if (user.role === 'ADMIN') {
      params = { listall: 'true' }
    } else if (user.role === 'RESELLER') {
      params = { domainid: user.domainId, isrecursive: 'true' }
    } else {
      params = { account: user.account, domainid: user.domainId }
    }

    // Filter by VM if provided
    if (virtualmachineid) {
      params.virtualmachineid = virtualmachineid
    }

    const data = await cloudstack('listVolumes', params)
    let volumes = data.listvolumesresponse?.volume || []

    // Ensure volumes is an array
    if (!Array.isArray(volumes) && volumes) {
      volumes = [volumes]
    }

    return NextResponse.json({ volumes, count: volumes.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, diskofferingid, zoneid, size } = await req.json()

    const params: Record<string, string> = { name, diskofferingid, zoneid }
    if (size !== undefined) params.size = String(size)

    const data = await cloudstack('createVolume', params)
    const jobId = data.createvolumeresponse?.jobid
    const result = await pollJob(jobId)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
