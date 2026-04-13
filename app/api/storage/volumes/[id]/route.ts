import { NextRequest, NextResponse } from 'next/server'
import { cloudstack, pollJob } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params
    const data = await cloudstack('listVolumes', { id })
    const volumes = data.listvolumesresponse?.volume || []
    return NextResponse.json(volumes[0] || null)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params
    const data = await cloudstack('deleteVolume', { id })
    return NextResponse.json(data.deletevolumeresponse || data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    if (body.action === 'attach') {
      const data = await cloudstack('attachVolume', { id: params.id, virtualmachineid: body.vmId })
      return NextResponse.json({ success: true })
    }
    if (body.action === 'detach') {
      const data = await cloudstack('detachVolume', { id: params.id })
      return NextResponse.json({ success: true })
    }
    if (body.action === 'resize') {
      const data = await cloudstack('resizeVolume', { id: params.id, size: String(body.size) })
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
