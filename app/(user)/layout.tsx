import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'
import { UserSidebar } from '@/components/layout/UserSidebar'
import { Topbar } from '@/components/layout/Topbar'

async function verifyUserToken() {
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

    if (payload.role !== 'USER') {
      redirect('/login')
    }

    return payload
  } catch {
    redirect('/login')
  }
}

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await verifyUserToken()

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      {/* Left: Sidebar */}
      <UserSidebar />

      {/* Right: content column */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Topbar />
        <main className="flex-1 overflow-auto bg-[var(--bg)] p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
