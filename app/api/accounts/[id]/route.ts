import { NextRequest, NextResponse } from 'next/server'
import { cloudstack, pollJob } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params
    const data = await cloudstack('listAccounts', { id })
    const accounts = data.listaccountsresponse?.account || []
    return NextResponse.json(accounts[0] || null)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params
    const { newname, networkdomain } = await req.json()

    const updateParams: Record<string, string> = { id, newname }
    if (networkdomain) updateParams.networkdomain = networkdomain

    const data = await cloudstack('updateAccount', updateParams)
    return NextResponse.json(data.updateaccountresponse?.account || data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params
    const data = await cloudstack('deleteAccount', { id })
    return NextResponse.json(data.deleteaccountresponse || data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
