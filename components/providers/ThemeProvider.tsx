'use client'

import { useEffect } from 'react'
import { useTheme, applyTheme, applyMode, applyRadius, applySidebarVariant, applySidebarCollapsible, applySidebarPosition } from '@/hooks/useTheme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, mode, radius, sidebarVariant, sidebarCollapsible, sidebarPosition } = useTheme()

  useEffect(() => {
    // Apply theme on mount and whenever theme/mode/radius changes
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    applyMode(mode)
  }, [mode])

  useEffect(() => {
    applyRadius(radius)
  }, [radius])

  useEffect(() => {
    applySidebarVariant(sidebarVariant)
  }, [sidebarVariant])

  useEffect(() => {
    applySidebarCollapsible(sidebarCollapsible)
  }, [sidebarCollapsible])

  useEffect(() => {
    applySidebarPosition(sidebarPosition)
  }, [sidebarPosition])

  return <>{children}</>
}
