import { SignJWT, jwtVerify } from 'jose'
import { NextRequest } from 'next/server'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export interface JWTPayload {
  id: string
  username: string
  email: string
  role: 'ADMIN' | 'RESELLER' | 'USER'
  domainId: string
  account: string
  resellerId?: string
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

export async function getAuthUser(req: NextRequest): Promise<JWTPayload | null> {
  const token = req.cookies.get('token')?.value
  if (!token) return null
  return verifyToken(token)
}
