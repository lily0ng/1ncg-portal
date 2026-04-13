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

    const data = await cloudstack('getVirtualMachineUserData', {
      virtualmachineid: params.id,
    })

    const rawUserdata = data.getvirtualmachineuserdataresponse?.virtualmachinedata?.userdata

    let userdata = ''
    if (rawUserdata) {
      try {
        userdata = Buffer.from(rawUserdata, 'base64').toString('utf-8')
      } catch {
        userdata = rawUserdata
      }
    }

    return NextResponse.json({ userdata })
  } catch (error: any) {
    console.error('[userdata] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to get user data', details: error?.message, userdata: '' },
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

    const body = await req.json()
    const { userdata } = body

    const encodedUserdata = userdata
      ? Buffer.from(userdata).toString('base64')
      : ''

    const data = await cloudstack('updateVirtualMachine', {
      id: params.id,
      userdata: encodedUserdata,
    })

    return NextResponse.json({ success: true, data: data.updatevirtualmachineresponse })
  } catch (error: any) {
    console.error('[userdata] POST error:', error)
    return NextResponse.json(
      { error: 'Failed to update user data', details: error?.message },
      { status: 500 }
    )
  }
}
