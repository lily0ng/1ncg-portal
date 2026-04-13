import { NextRequest, NextResponse } from 'next/server'
import { cloudstack } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const params: Record<string,string> = {}
    if (user.role === 'ADMIN') params.listall = 'true'
    else { params.account = user.account; params.domainid = user.domainId }
    const data = await cloudstack('listProjects', params)
    const projects = data.listprojectsresponse?.project || []
    return NextResponse.json({ projects, count: projects.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const data = await cloudstack('createProject', { name: body.name, displaytext: body.displaytext || body.name })
    return NextResponse.json({ project: data.createprojectresponse })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
