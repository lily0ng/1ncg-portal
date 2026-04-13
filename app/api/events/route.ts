import { NextRequest, NextResponse } from 'next/server'
import { cloudstack } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const page = searchParams.get('page') || '1'
    const pagesize = searchParams.get('pagesize') || '50'
    const resourceid = searchParams.get('resourceid')
    const type = searchParams.get('type')
    const level = searchParams.get('level')

    const params: Record<string, string> = { page, pagesize }
    // CloudStack requires resourcetype when using resourceid
    if (resourceid) {
      params.resourceid = resourceid
      params.resourcetype = 'VirtualMachine'  // Required by CloudStack API
    }   
    if (type) params.type = type
    if (level) params.level = level

    console.log('[Events API] Fetching events with params:', params)

    const data = await cloudstack('listEvents', params)
    console.log('[Events API] CloudStack response:', JSON.stringify(data).slice(0, 500))

    // Handle CloudStack response structure
    let events: any[] = []
    if (data.listeventsresponse) {
      // CloudStack returns events directly or nested
      events = data.listeventsresponse.event || []
      // If only one event, CloudStack returns object instead of array
      if (!Array.isArray(events) && events) {
        events = [events]
      }
    }

    console.log(`[Events API] Found ${events.length} events`)

    return NextResponse.json({
      events,
      count: events.length,
      resourceid: resourceid || null
    })
  } catch (error: any) {
    console.error('[Events API] Error:', error)
    return NextResponse.json({
      error: error.message || 'Internal Server Error',
      events: [],
      count: 0
    }, { status: 500 })
  }
}
