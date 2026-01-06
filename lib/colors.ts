/**
 * Color palette interface for canvas and image rendering
 */
export interface ColorPalette {
  lived: string
  remaining: string
  current: string
  background: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  border: string
  hoveredLived: string
  hoveredRemaining: string
}

/** Light theme colors - matches CSS :root variables */
export const lightColors: ColorPalette = {
  lived: '#1a1a1a',
  remaining: '#e8e4df',
  current: '#c45d3a',
  background: '#faf8f5',
  textPrimary: '#1a1a1a',
  textSecondary: '#6b6560',
  textMuted: '#a8a29e',
  border: '#d4cfc8',
  hoveredLived: '#c45d3a',
  hoveredRemaining: '#d4cfc8',
}

/** Dark theme colors - matches CSS .dark variables */
export const darkColors: ColorPalette = {
  lived: '#e8e4df',
  remaining: '#2a2725',
  current: '#e07a54',
  background: '#141211',
  textPrimary: '#f5f5f4',
  textSecondary: '#a8a29e',
  textMuted: '#6b6560',
  border: '#3d3835',
  hoveredLived: '#e07a54',
  hoveredRemaining: '#3d3835',
}

/**
 * Get colors for server-side rendering (API routes).
 * Use useThemeColors() hook for client components instead.
 */
export function getServerColors(isDark: boolean): ColorPalette {
  return isDark ? darkColors : lightColors
}
