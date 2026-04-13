import { NextRequest, NextResponse } from 'next/server'
import { cloudstack, pollJob } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await cloudstack('listSnapshots', { listall: 'true' })
    const snapshots = data.listsnapshotsresponse?.snapshot || []
    return NextResponse.json({ snapshots, count: snapshots.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { volumeid, name } = await req.json()

    const data = await cloudstack('createSnapshot', { volumeid, name, quiescevm: 'true' })
    const jobId = data.createsnapshotresponse?.jobid
    const result = await pollJob(jobId)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
