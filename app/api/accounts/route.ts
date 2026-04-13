import { NextRequest, NextResponse } from 'next/server'
import { cloudstack, pollJob } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await cloudstack('listAccounts', { listall: 'true' })
    const accounts = data.listaccountsresponse?.account || []
    return NextResponse.json({ accounts, count: accounts.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { username, password, firstname, lastname, email, accounttype, domainid } = await req.json()

    const params: Record<string, string> = {
      username,
      password,
      firstname,
      lastname,
      email,
      accounttype: String(accounttype),
    }
    if (domainid) params.domainid = domainid

    const data = await cloudstack('createAccount', params)
    return NextResponse.json(data.createaccountresponse?.account || data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
