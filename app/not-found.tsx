import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ margin: 0, background: '#0f1117', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '1.5rem',
        textAlign: 'center',
        padding: '2rem',
      }}>
        <div style={{
          fontSize: '6rem',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
        }}>
          404
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Page not found</h1>
        <p style={{ color: '#94a3b8', margin: 0, maxWidth: '28rem' }}>
          The page you&apos;re looking for doesn&apos;t exist or you may not have permission to access it.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/admin/dashboard" style={{ padding: '0.625rem 1.25rem', background: '#6366f1', color: '#fff', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Admin Portal</Link>
          <Link href="/reseller/dashboard" style={{ padding: '0.625rem 1.25rem', background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Reseller Portal</Link>
          <Link href="/portal/dashboard" style={{ padding: '0.625rem 1.25rem', background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>User Portal</Link>
          <Link href="/login" style={{ padding: '0.625rem 1.25rem', background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Login</Link>
        </div>
      </div>
    </div>
  )
}
