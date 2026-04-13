import { NextRequest, NextResponse } from 'next/server'
import { cloudstack } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'
import { db } from '@/lib/db'

interface Params { params: { id: string } }

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser(req)
    if (!user || (user.role !== 'ADMIN' && user.role !== 'RESELLER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reseller = await db.reseller.findUnique({ where: { id: params.id } })
    if (!reseller) return NextResponse.json({ error: 'Reseller not found' }, { status: 404 })

    // Resellers can only view their own customers
    if (user.role === 'RESELLER' && user.resellerId !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data = await cloudstack('listAccounts', {
      domainid: reseller.domainId,
      isrecursive: 'true'
    })

    return NextResponse.json(data.listaccountsresponse?.account || [])
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
