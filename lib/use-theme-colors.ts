'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '@/components/ThemeProvider'
import { type ColorPalette, lightColors } from './colors'

// Re-export types and server function for convenience
export type { ColorPalette } from './colors'
export { getServerColors } from './colors'

/**
 * CSS variable to ColorPalette key mapping
 */
const CSS_VAR_MAP: Record<keyof ColorPalette, string> = {
  lived: '--color-lived',
  remaining: '--color-remaining',
  current: '--color-accent',
  background: '--color-bg',
  textPrimary: '--color-text',
  textSecondary: '--color-text-secondary',
  textMuted: '--color-text-muted',
  border: '--color-border',
  hoveredLived: '--color-accent',      // Same as current/accent
  hoveredRemaining: '--color-border',  // Same as border
}

/**
 * Read a CSS variable value from the document
 */
function getCSSVariable(name: string): string {
  if (typeof document === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/**
 * Read all CSS variables and build a ColorPalette
 */
function readColorsFromCSS(): ColorPalette {
  const palette = {} as ColorPalette
  for (const [key, cssVar] of Object.entries(CSS_VAR_MAP)) {
    palette[key as keyof ColorPalette] = getCSSVariable(cssVar)
  }
  return palette
}

/**
 * Hook that reads theme colors from CSS variables.
 * Automatically updates when theme changes.
 * Use this for canvas rendering that needs direct color values.
 */
export function useThemeColors(): ColorPalette {
  const { isDark } = useTheme()
  const [colors, setColors] = useState<ColorPalette>(() => {
    // Return placeholder during SSR
    if (typeof document === 'undefined') {
      return lightColors
    }
    return readColorsFromCSS()
  })

  const updateColors = useCallback(() => {
    // Small delay to ensure CSS variables are updated
    requestAnimationFrame(() => {
      setColors(readColorsFromCSS())
    })
  }, [])

  useEffect(() => {
    updateColors()
  }, [isDark, updateColors])

  return colors
}
