import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    const apps = await db.marketplaceApp.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ apps })
  } catch (error) {
    console.error('Error fetching marketplace:', error)
    return NextResponse.json({ error: 'Failed to fetch apps' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const app = await db.marketplaceApp.create({ data: body })
    return NextResponse.json({ app })
  } catch (error) {
    console.error('Error creating app:', error)
    return NextResponse.json({ error: 'Failed to create app' }, { status: 500 })
  }
}
