import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { Topbar } from '@/components/layout/Topbar'

async function verifyAdminToken() {
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

    if (payload.role !== 'ADMIN') {
      redirect('/login')
    }

    return payload
  } catch {
    redirect('/login')
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await verifyAdminToken()

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      {/* Left: Sidebar — width managed internally (240px expanded / 64px collapsed) */}
      <AdminSidebar />

      {/* Right: content column */}
      <div className="flex flex-1 flex-col min-w-0 overflow-y-auto">
        <Topbar />
        <main className="flex-1 bg-[var(--bg)] p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
