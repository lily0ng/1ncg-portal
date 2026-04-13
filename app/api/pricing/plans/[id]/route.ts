import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { db } from '@/lib/db'

interface Params { params: { id: string } }

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser(req)
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
      name,
      description,
      currency,
      vcpuPrice,
      ramGbPrice,
      storageGbPrice,
      ipPrice,
      bandwidthGbPrice,
      snapshotGbPrice,
      lbPrice,
      k8sNodePrice,
      minMonthlyFee,
      active
    } = body

    const data: Record<string, any> = {}
    if (name !== undefined) data.name = name
    if (description !== undefined) data.description = description
    if (currency !== undefined) data.currency = currency
    if (vcpuPrice !== undefined) data.vcpuPrice = Number(vcpuPrice)
    if (ramGbPrice !== undefined) data.ramGbPrice = Number(ramGbPrice)
    if (storageGbPrice !== undefined) data.storageGbPrice = Number(storageGbPrice)
    if (ipPrice !== undefined) data.ipPrice = Number(ipPrice)
    if (bandwidthGbPrice !== undefined) data.bandwidthGbPrice = Number(bandwidthGbPrice)
    if (snapshotGbPrice !== undefined) data.snapshotGbPrice = Number(snapshotGbPrice)
    if (lbPrice !== undefined) data.lbPrice = Number(lbPrice)
    if (k8sNodePrice !== undefined) data.k8sNodePrice = Number(k8sNodePrice)
    if (minMonthlyFee !== undefined) data.minMonthlyFee = Number(minMonthlyFee)
    if (active !== undefined) data.active = Boolean(active)

    const plan = await db.pricingPlan.update({
      where: { id: params.id },
      data
    })

    return NextResponse.json(plan)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser(req)
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await db.pricingPlan.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
