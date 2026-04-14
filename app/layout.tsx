import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import ToastProvider from '@/components/ToastProvider'
import './globals.css'

// Suppress React 19 script tag warning - works for both SSR and CSR
const originalError = console.error
console.error = (...args: unknown[]) => {
  const message = typeof args[0] === 'string' ? args[0] : ''
  if (
    message.includes('Encountered a script tag while rendering React component') ||
    message.includes('Scripts inside React components are never executed')
  ) {
    return
  }
  originalError.apply(console, args)
}

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-[var(--bg)] text-[var(--text)]`}>
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
            <ToastProvider />
          </ThemeProvider>
        </body>
      </html>
  )
}