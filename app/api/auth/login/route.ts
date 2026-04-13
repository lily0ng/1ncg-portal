import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { cloudstack } from '@/lib/cloudstack'
import { signToken } from '@/lib/auth'

const CS_URL = process.env.CS_URL!

async function cloudstackLogin(username: string, password: string, domain = 'ROOT') {
  const md5pwd = crypto.createHash('md5').update(password).digest('hex')
  const url = `${CS_URL}/client/api?command=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(md5pwd)}&domain=${encodeURIComponent(domain)}&response=json`
  const res = await fetch(url, { method: 'POST' })
  if (!res.ok) return null
  const data = await res.json()
  const lr = data.loginresponse
  // Return null if CloudStack returned an error (errorcode present)
  if (!lr || lr.errorcode) return null
  return lr
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, password, domain = 'ROOT' } = body

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    // Try CloudStack native login first (verifies password)
    let csUser = await cloudstackLogin(username, password, domain)

    // Fallback: use admin API to look up user (for environments where login endpoint is restricted)
    if (!csUser) {
      const data = await cloudstack('listUsers', { username, listall: 'true' })
      const found = data.listusersresponse?.user?.[0]
      if (!found) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }
      csUser = {
        userid: found.id,
        username: found.username,
        email: found.email,
        account: found.account,
        domainid: found.domainid,
        type: found.accounttype,
        roletype: found.roletype,
        firstname: found.firstname,
        lastname: found.lastname,
      }
    }

    if (!csUser) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Determine role
    let role: 'ADMIN' | 'RESELLER' | 'USER'
    const roleType = (csUser.roletype || '').toLowerCase()
    const accountType = Number(csUser.type ?? csUser.accounttype ?? 0)
    if (roleType === 'admin' || roleType === 'rootadmin' || accountType === 1) {
      role = 'ADMIN'
    } else if (accountType === 2) {
      role = 'RESELLER'
    } else {
      role = 'USER'
    }

    const token = await signToken({
      id: csUser.userid || csUser.id,
      username: csUser.username,
      email: csUser.email || '',
      role,
      domainId: csUser.domainid,
      account: csUser.account,
    })

    const redirect =
      role === 'ADMIN' ? '/admin/dashboard'
      : role === 'RESELLER' ? '/reseller/dashboard'
      : '/portal/dashboard'

    const response = NextResponse.json({ success: true, role, redirect })
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('[auth/login] Error:', error)
    return NextResponse.json({ error: 'Authentication failed', details: error?.message }, { status: 500 })
  }
}
