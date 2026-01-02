// Shared constants for Life in Weeks visualization

export const TOTAL_YEARS = 90
export const WEEKS_PER_YEAR = 52
export const TOTAL_WEEKS = TOTAL_YEARS * WEEKS_PER_YEAR

// Color palette with semantic names
export const colors = {
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

// Layout constants
export const PADDING_X_RATIO = 0.06
export const PADDING_Y_RATIO = 0.04
export const SPACING_RATIO = 0.18

/**
 * Calculate the number of weeks lived from birth date to today
 * Uses birthday-aligned calculation so each row represents one year of life
 */
export function calculateWeeksLived(birthDate: Date): number {
  const today = new Date()
  
  // Calculate age in complete years
  let age = today.getFullYear() - birthDate.getFullYear()
  const hadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate())
  
  if (!hadBirthdayThisYear) {
    age--
  }
  
  // Calculate last birthday date
  const lastBirthday = new Date(birthDate)
  lastBirthday.setFullYear(birthDate.getFullYear() + age)
  
  // Calculate weeks since last birthday
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const weeksSinceLastBirthday = Math.floor(
    (today.getTime() - lastBirthday.getTime()) / msPerWeek
  )
  
  // Total weeks = complete years × 52 + weeks into current year
  const weeksLived = age * WEEKS_PER_YEAR + Math.min(weeksSinceLastBirthday, WEEKS_PER_YEAR - 1)
  
  return Math.min(Math.max(0, weeksLived), TOTAL_WEEKS)
}

/**
 * Calculate grid layout dimensions based on container size and top space ratio
 */
export function calculateGridLayout(
  width: number,
  height: number,
  topSpaceRatio: number
) {
  const paddingX = width * PADDING_X_RATIO
  const paddingY = height * PADDING_Y_RATIO
  const topSpace = height * topSpaceRatio

  const availableWidth = width - 2 * paddingX
  const availableHeight = height - paddingY - topSpace

  const cellWidth = availableWidth / WEEKS_PER_YEAR
  const cellHeight = availableHeight / TOTAL_YEARS
  const cellSize = Math.min(cellWidth, cellHeight)

  const boxSize = cellSize * (1 - SPACING_RATIO)
  const borderRadius = Math.max(1, boxSize * 0.15)

  const gridWidth = WEEKS_PER_YEAR * cellSize
  const gridHeight = TOTAL_YEARS * cellSize

  const startX = (width - gridWidth) / 2
  const startY = topSpace

  return {
    paddingX,
    paddingY,
    topSpace,
    cellSize,
    boxSize,
    borderRadius,
    gridWidth,
    gridHeight,
    startX,
    startY,
  }
}

/**
 * Get the color for a week cell based on its state
 */
export function getWeekColor(
  weekNumber: number,
  weeksLived: number,
  isHovered: boolean = false
): string {
  const isCurrentWeek = weekNumber === weeksLived

  if (isCurrentWeek) {
    return colors.current
  } else if (weekNumber < weeksLived) {
    return isHovered ? colors.hoveredLived : colors.lived
  } else {
    return isHovered ? colors.hoveredRemaining : colors.remaining
  }
}

// Fading constants
const FADE_START_YEARS = 10 // Years ago when fading starts
const FADE_START_WEEKS = FADE_START_YEARS * WEEKS_PER_YEAR
const MIN_OPACITY = 0.15 // Minimum opacity for oldest weeks

/**
 * Calculate fade opacity for a lived week based on how long ago it was.
 * Weeks within the last 10 years are fully opaque.
 * Older weeks gradually fade toward the background.
 */
export function getFadeOpacity(weekNumber: number, weeksLived: number): number {
  // Only apply fading to past weeks
  if (weekNumber >= weeksLived) {
    return 1.0
  }

  const weeksAgo = weeksLived - weekNumber

  // No fading for recent weeks (last 10 years)
  if (weeksAgo <= FADE_START_WEEKS) {
    return 1.0
  }

  // Calculate how far past the fade threshold we are
  const weeksIntoFade = weeksAgo - FADE_START_WEEKS
  const maxFadeWeeks = weeksLived - FADE_START_WEEKS // Total weeks that can fade

  if (maxFadeWeeks <= 0) {
    return 1.0
  }

  // Smooth easing: use square root for a gentle fade curve
  const fadeProgress = Math.min(weeksIntoFade / maxFadeWeeks, 1.0)
  const easedProgress = Math.sqrt(fadeProgress)

  // Interpolate from 1.0 to MIN_OPACITY
  return 1.0 - easedProgress * (1.0 - MIN_OPACITY)
}

/**
 * Parse a hex color string to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) {
    return { r: 0, g: 0, b: 0 }
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

/**
 * Convert RGB values to hex color string
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Blend two colors together based on opacity.
 * At opacity 1.0, returns foreground color.
 * At opacity 0.0, returns background color.
 */
export function blendColors(
  foreground: string,
  background: string,
  opacity: number
): string {
  const fg = hexToRgb(foreground)
  const bg = hexToRgb(background)

  const r = fg.r * opacity + bg.r * (1 - opacity)
  const g = fg.g * opacity + bg.g * (1 - opacity)
  const b = fg.b * opacity + bg.b * (1 - opacity)

  return rgbToHex(r, g, b)
}

/**
 * Get the faded color for a lived week, blending toward background based on age.
 */
export function getFadedWeekColor(
  weekNumber: number,
  weeksLived: number,
  livedColor: string = colors.lived,
  backgroundColor: string = colors.background
): string {
  const opacity = getFadeOpacity(weekNumber, weeksLived)
  return blendColors(livedColor, backgroundColor, opacity)
}

// ============================================================================
// Date parsing and validation utilities
// ============================================================================

/**
 * Parse a birth date string (YYYY-MM-DD) to a Date object.
 * Uses midnight local time to avoid timezone issues.
 */
export function parseBirthDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00')
}

/**
 * Validation result for birth date
 */
export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validate a birth date.
 * Checks: valid date, not in future, not more than 90 years ago.
 */
export function validateBirthDate(date: Date): ValidationResult {
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date format' }
  }

  const today = new Date()

  if (date > today) {
    return { valid: false, error: 'Birth date must be in the past' }
  }

  const yearsAgo = (today.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  if (yearsAgo > TOTAL_YEARS) {
    return { valid: false, error: `Birth date cannot be more than ${TOTAL_YEARS} years ago` }
  }

  return { valid: true }
}

// ============================================================================
// Life statistics calculation
// ============================================================================

/**
 * Complete life statistics based on birth date
 */
export interface LifeStats {
  weeksLived: number
  weeksRemaining: number
  daysLived: number
  daysRemaining: number
  yearsLived: number
  percentageLived: number
}

/**
 * Calculate all life statistics from a birth date.
 * Single source of truth for all stats calculations.
 */
export function calculateLifeStats(birthDate: Date): LifeStats {
  const today = new Date()
  const msPerDay = 24 * 60 * 60 * 1000

  const daysLived = Math.floor((today.getTime() - birthDate.getTime()) / msPerDay)
  const weeksLived = calculateWeeksLived(birthDate)
  const weeksRemaining = Math.max(0, TOTAL_WEEKS - weeksLived)
  const totalDays = Math.round(TOTAL_YEARS * 365.25)
  const daysRemaining = Math.max(0, totalDays - daysLived)
  const yearsLived = daysLived / 365.25
  const percentageLived = (weeksLived / TOTAL_WEEKS) * 100

  return {
    weeksLived,
    weeksRemaining,
    daysLived,
    daysRemaining,
    yearsLived,
    percentageLived,
  }
}
