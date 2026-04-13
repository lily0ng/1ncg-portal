import { NextRequest, NextResponse } from 'next/server'
import { cloudstack } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let params: Record<string, string> = {}
    if (user.role === 'ADMIN') {
      params = { listall: 'true' }
    } else if (user.role === 'RESELLER') {
      params = { domainid: user.domainId, isrecursive: 'true' }
    } else {
      params = { account: user.account, domainid: user.domainId }
    }

    const data = await cloudstack('listAffinityGroups', params)
    return NextResponse.json(
      (() => { const groups = data.listaffinitygroupsresponse?.affinitygroup || []; return { groups, count: groups.length }; })()
    )
  } catch (error: any) {
    console.error('[affinity-groups] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch affinity groups', details: error?.message },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, type, description } = body

    if (!name || !type) {
      return NextResponse.json(
        { error: 'name and type are required' },
        { status: 400 }
      )
    }

    const groupParams: Record<string, string> = { name, type }
    if (description) groupParams.description = description

    if (user.role !== 'ADMIN') {
      groupParams.account = user.account
      groupParams.domainid = user.domainId
    }

    const data = await cloudstack('createAffinityGroup', groupParams)
    return NextResponse.json(
      data.createaffinitygroupresponse?.affinitygroup ?? data,
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[affinity-groups] POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create affinity group', details: error?.message },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Query parameter "id" is required' },
        { status: 400 }
      )
    }

    const data = await cloudstack('deleteAffinityGroup', { id })
    return NextResponse.json(
      data.deleteaffinitygroupresponse ?? { success: true }
    )
  } catch (error: any) {
    console.error('[affinity-groups] DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete affinity group', details: error?.message },
      { status: 500 }
    )
  }
}
