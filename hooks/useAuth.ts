import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { JWTPayload } from '@/lib/auth'

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<JWTPayload | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/login')
  }

  return { user, loading, logout }
}
