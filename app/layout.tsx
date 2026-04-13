import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: '1CNG Cloud Portal',
    template: '%s | 1CNG Cloud Portal',
  },
  description: 'Cloud Management Portal — powered by Apache CloudStack',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark-nebula"
          enableSystem={false}
          themes={[
            'dark-nebula',
            'ocean-breeze',
            'forest-night',
            'sunset-pro',
            'arctic-light',
            'rose-gold',
            'monochrome',
          ]}
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster
            position="top-right"
            expand={false}
            duration={4000}
            gap={12}
            visibleToasts={6}
            toastOptions={{
              style: {
                background: 'var(--surface)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '16px 20px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
              },
              className: 'custom-toast',
            }}
            icons={{
              success: <CheckCircle2 className="w-5 h-5 text-green-400" />,
              error: <XCircle className="w-5 h-5 text-red-400" />,
              warning: <AlertCircle className="w-5 h-5 text-amber-400" />,
              info: <Info className="w-5 h-5 text-blue-400" />,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
