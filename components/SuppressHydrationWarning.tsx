'use client'

import { useEffect } from 'react'

export function SuppressHydrationWarning() {
  useEffect(() => {
    // Suppress the specific React 19 script tag warning
    const originalError = console.error
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || ''
      if (
        message.includes('Encountered a script tag while rendering React component') ||
        message.includes('Scripts inside React components are never executed')
      ) {
        return // Suppress this warning
      }
      originalError.apply(console, args)
    }

    return () => {
      console.error = originalError
    }
  }, [])

  return null
}
