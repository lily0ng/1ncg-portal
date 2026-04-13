import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const where: any = user.role === 'ADMIN' ? {} : { userId: user.id }
    const invoices = await db.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true, email: true } } },
    })

    const summary = {
      totalBilled: invoices.reduce((s: number, i: any) => s + (i.amountMMK || 0), 0),
      outstanding: invoices.filter((i: any) => i.status === 'UNPAID' || i.status === 'OVERDUE')
                          .reduce((s: number, i: any) => s + (i.amountMMK || 0), 0),
    }

    return NextResponse.json({ invoices, summary })
  } catch (error: any) {
    console.error('[billing/invoices] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const invoice = await db.invoice.create({
      data: {
        userId: body.userId,
        invoiceNo: body.invoiceNo || `INV-${Date.now()}`,
        amount: Number(body.amount || body.amountMMK || 0),
        amountMMK: Number(body.amountMMK || 0),
        month: body.month || new Date().toISOString().slice(0, 7),
        status: (body.status || 'UNPAID') as any,
        dueAt: body.dueAt ? new Date(body.dueAt) : new Date(Date.now() + 30 * 86400000),
        items: body.items || [],
      }
    })
    return NextResponse.json({ invoice }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
