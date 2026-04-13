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

    const data = await cloudstack('listSSHKeyPairs', params)
    const keypairs = data.listsshkeypairsresponse?.sshkeypair || []
    return NextResponse.json({ keypairs, count: keypairs.length })
  } catch (error: any) {
    console.error('[ssh-keys] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SSH key pairs', details: error?.message },
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
    const { name, publickey } = body

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const keyParams: Record<string, string> = { name }
    if (user.role !== 'ADMIN') {
      keyParams.account = user.account
      keyParams.domainid = user.domainId
    }

    let data: any
    if (publickey) {
      // Register an existing public key
      keyParams.publickey = publickey
      data = await cloudstack('registerSSHKeyPair', keyParams)
      return NextResponse.json(
        data.registersshkeypairresponse?.keypair ?? data,
        { status: 201 }
      )
    } else {
      // Generate a new key pair and return private key
      data = await cloudstack('createSSHKeyPair', keyParams)
      return NextResponse.json(
        data.createsshkeypairresponse?.keypair ?? data,
        { status: 201 }
      )
    }
  } catch (error: any) {
    console.error('[ssh-keys] POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create SSH key pair', details: error?.message },
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
    const name = searchParams.get('name')

    if (!name) {
      return NextResponse.json(
        { error: 'Query parameter "name" is required' },
        { status: 400 }
      )
    }

    const deleteParams: Record<string, string> = { name }
    if (user.role !== 'ADMIN') {
      deleteParams.account = user.account
      deleteParams.domainid = user.domainId
    }

    const data = await cloudstack('deleteSSHKeyPair', deleteParams)
    return NextResponse.json(
      data.deletesshkeypairresponse ?? { success: true }
    )
  } catch (error: any) {
    console.error('[ssh-keys] DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete SSH key pair', details: error?.message },
      { status: 500 }
    )
  }
}
