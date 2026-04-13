import { NextRequest, NextResponse } from 'next/server'
import { cloudstack, pollJob } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await cloudstack('listRoles', {})
    return NextResponse.json(data.listrolesresponse?.role || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, type, description } = await req.json()

    const params: Record<string, string> = { name, type }
    if (description) params.description = description

    const data = await cloudstack('createRole', params)
    return NextResponse.json(data.createrolereponse?.role || data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
