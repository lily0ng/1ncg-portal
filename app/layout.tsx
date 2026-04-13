import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
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
            richColors
            closeButton
            toastOptions={{
              style: {
                background: 'var(--surface)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
