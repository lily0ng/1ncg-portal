import { NextRequest, NextResponse } from 'next/server'
import { cloudstack } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await cloudstack('listWebhooks', { listall: 'true' })
    return NextResponse.json(data.listwebhooksresponse?.webhook || [])
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, payloadurl, events, scope, sslverification } = await req.json()

    if (!name || !payloadurl) {
      return NextResponse.json({ error: 'name and payloadurl are required' }, { status: 400 })
    }

    const params: Record<string, string> = {
      name,
      payloadurl,
      scope: scope || 'Local',
      sslverification: sslverification !== undefined ? String(sslverification) : 'true'
    }
    if (events) params.events = events

    const data = await cloudstack('createWebhook', params)
    return NextResponse.json(data.createwebhookresponse?.webhook ?? data, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 })

    await cloudstack('deleteWebhook', { id })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
