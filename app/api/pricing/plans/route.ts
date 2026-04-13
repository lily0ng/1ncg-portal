import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const plans = await db.pricingPlan.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(plans)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
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

    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

    const plan = await db.pricingPlan.create({
      data: {
        name,
        description: description || null,
        currency: currency || 'USD',
        vcpuPrice: vcpuPrice !== undefined ? Number(vcpuPrice) : 0,
        ramGbPrice: ramGbPrice !== undefined ? Number(ramGbPrice) : 0,
        storageGbPrice: storageGbPrice !== undefined ? Number(storageGbPrice) : 0,
        ipPrice: ipPrice !== undefined ? Number(ipPrice) : 0,
        bandwidthGbPrice: bandwidthGbPrice !== undefined ? Number(bandwidthGbPrice) : 0,
        snapshotGbPrice: snapshotGbPrice !== undefined ? Number(snapshotGbPrice) : 0,
        lbPrice: lbPrice !== undefined ? Number(lbPrice) : 0,
        k8sNodePrice: k8sNodePrice !== undefined ? Number(k8sNodePrice) : 0,
        minMonthlyFee: minMonthlyFee !== undefined ? Number(minMonthlyFee) : 0,
        active: active !== undefined ? Boolean(active) : true
      }
    })

    return NextResponse.json(plan, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
