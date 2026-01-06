import { ImageResponse } from '@vercel/og'
import {
  TOTAL_YEARS,
  WEEKS_PER_YEAR,
  getServerColors,
  calculateGridLayout,
  getFadedWeekColor,
  parseBirthDate,
  validateBirthDate,
  calculateLifeStats,
} from '@/lib/life-in-weeks'

// API image uses larger top space ratio (no title, just grid with subtitle below)
const API_IMAGE_TOP_SPACE_RATIO = 0.25

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const birthDateParam = searchParams.get('birthDate')
  const width = parseInt(searchParams.get('width') || '1170')
  const height = parseInt(searchParams.get('height') || '2532')
  const isDark = searchParams.get('dark') === 'true'

  if (!birthDateParam) {
    return new Response('Missing birthDate parameter', { status: 400 })
  }

  const birthDate = parseBirthDate(birthDateParam)
  const validation = validateBirthDate(birthDate)

  if (!validation.valid) {
    return new Response(validation.error, { status: 400 })
  }

  // Get theme-appropriate colors (server-side)
  const colors = getServerColors(isDark)

  const stats = calculateLifeStats(birthDate)
  const daysPercentage = ((stats.daysLived / (TOTAL_YEARS * 365.25)) * 100).toFixed(3)

  // Calculate grid layout using shared function
  const layout = calculateGridLayout(width, height, API_IMAGE_TOP_SPACE_RATIO)
  const { startX, topSpace, cellSize, boxSize, borderRadius } = layout

  // Generate rows with exactly 52 week cells each (no flex-wrap, explicit row containers)
  const rows = []
  for (let year = 0; year < TOTAL_YEARS; year++) {
    const weekCells = []
    for (let week = 0; week < WEEKS_PER_YEAR; week++) {
      const weekNumber = year * WEEKS_PER_YEAR + week
      const isCurrentWeek = weekNumber === stats.weeksLived
      const isLived = weekNumber < stats.weeksLived
      
      // Get color - apply fading for lived weeks older than 10 years
      let color: string
      if (isCurrentWeek) {
        color = colors.current
      } else if (isLived) {
        color = getFadedWeekColor(weekNumber, stats.weeksLived, colors.lived, colors.background)
      } else {
        color = colors.remaining
      }

      weekCells.push(
        <div
          key={`${year}-${week}`}
          style={{
            width: cellSize,
            height: cellSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: boxSize,
              height: boxSize,
              backgroundColor: color,
              borderRadius: borderRadius,
            }}
          />
        </div>
      )
    }
    
    // Each row is a flex container with exactly 52 weeks
    rows.push(
      <div
        key={`year-${year}`}
        style={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        {weekCells}
      </div>
    )
  }

  // Generate year markers (now boxes are centered in cells, so we use cellSize / 2)
  const yearFontSize = Math.max(9, height * 0.01)
  const yearMarkers = []
  for (let year = 0; year <= TOTAL_YEARS; year += 10) {
    const yPos = topSpace + year * cellSize + (year < TOTAL_YEARS ? cellSize / 2 : 0)
    yearMarkers.push(
      <div
        key={`year-${year}`}
        style={{
          position: 'absolute',
          left: startX - 30,
          top: yPos - yearFontSize / 2,
          fontSize: yearFontSize,
          fontFamily: 'monospace',
          color: colors.textMuted,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          width: 20,
          height: yearFontSize,
        }}
      >
        {year === TOTAL_YEARS ? '90' : String(year)}
      </div>
    )
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: colors.background,
          position: 'relative',
        }}
      >

        {/* Year markers container */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          {yearMarkers}
        </div>

        {/* Grid - explicit row containers to enforce exactly 52 weeks per row */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: topSpace,
          }}
        >
          {rows}
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            marginTop: 15,
            fontSize: Math.max(11, height * 0.013),
            color: colors.textSecondary,
            fontFamily: 'monospace',
          }}
        >
          {` ${stats.daysLived.toLocaleString()} days · ${stats.weeksLived.toLocaleString()} weeks · ${stats.yearsLived.toFixed(1)} years · ${daysPercentage}%`}
        </div>

      </div>
    ),
    {
      width,
      height,
    }
  )
}
