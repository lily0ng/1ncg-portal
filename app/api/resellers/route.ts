import { NextRequest, NextResponse } from 'next/server'
import { cloudstack } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'
import { db } from '@/lib/db'
import crypto from 'crypto'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const resellers = await db.reseller.findMany({
      include: { customers: { select: { id: true } } },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(resellers.map(r => ({ ...r, customerCount: r.customers.length })))
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { name, email, domainid, commission = 0.10, markupPct = 0.20 } = await req.json()
    const password = crypto.randomBytes(16).toString('hex')
    const parts = name.split(' ')
    const csData = await cloudstack('createAccount', {
      username: name.toLowerCase().replace(/\s+/g, '.'),
      password,
      firstname: parts[0],
      lastname: parts.slice(1).join(' ') || 'Reseller',
      email,
      accounttype: '1',
      ...(domainid ? { domainid } : {})
    })
    const csAccount = csData.createaccountresponse?.account
    const reseller = await db.reseller.create({
      data: {
        csAccountId: csAccount?.id || crypto.randomBytes(8).toString('hex'),
        name, email,
        domainId: domainid || 'ROOT',
        commission: Number(commission),
        markupPct: Number(markupPct)
      }
    })
    return NextResponse.json(reseller, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
