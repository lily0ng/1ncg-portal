import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    const plans = await db.pricingPlan.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Error fetching pricing:', error)
    return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const plan = await db.pricingPlan.create({ data: body })
    return NextResponse.json({ plan })
  } catch (error) {
    console.error('Error creating pricing plan:', error)
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 })
  }
}
