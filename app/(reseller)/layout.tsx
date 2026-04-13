import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'
import { ResellerSidebar } from '@/components/layout/ResellerSidebar'
import { Topbar } from '@/components/layout/Topbar'

async function verifyResellerToken() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    redirect('/login')
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'fallback-secret-change-in-production'
    )
    const { payload } = await jwtVerify(token, secret)

    if (payload.role !== 'RESELLER') {
      redirect('/login')
    }

    return payload
  } catch {
    redirect('/login')
  }
}

export default async function ResellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await verifyResellerToken()

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      <ResellerSidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Topbar />
        <main className="flex-1 overflow-auto bg-[var(--bg)] p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
