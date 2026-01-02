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
