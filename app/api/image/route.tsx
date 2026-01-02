import { ImageResponse } from '@vercel/og'
import {
  TOTAL_YEARS,
  WEEKS_PER_YEAR,
  TOTAL_WEEKS,
  colors,
  calculateWeeksLived,
  calculateGridLayout,
  getWeekColor,
} from '@/lib/life-in-weeks'

// API image uses larger top space ratio (no title, just grid with subtitle below)
const API_IMAGE_TOP_SPACE_RATIO = 0.25

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const birthDateParam = searchParams.get('birthDate')
  const width = parseInt(searchParams.get('width') || '1170')
  const height = parseInt(searchParams.get('height') || '2532')

  if (!birthDateParam) {
    return new Response('Missing birthDate parameter', { status: 400 })
  }

  const birthDate = new Date(birthDateParam + 'T00:00:00')
  if (isNaN(birthDate.getTime())) {
    return new Response('Invalid birthDate format', { status: 400 })
  }

  const weeksLived = calculateWeeksLived(birthDate)

  const weeksPercentage = ((weeksLived / TOTAL_WEEKS) * 100).toFixed(2)

  // Calculate grid layout using shared function
  const layout = calculateGridLayout(width, height, API_IMAGE_TOP_SPACE_RATIO)
  const { startX, topSpace, cellSize, boxSize, borderRadius, gridWidth } = layout

  // Generate week cells - wrap each box in a cell container to center it (matching canvas behavior)
  const weeks = []
  for (let year = 0; year < TOTAL_YEARS; year++) {
    for (let week = 0; week < WEEKS_PER_YEAR; week++) {
      const weekNumber = year * WEEKS_PER_YEAR + week
      const color = getWeekColor(weekNumber, weeksLived)

      weeks.push(
        <div
          key={`${year}-${week}`}
          style={{
            width: cellSize,
            height: cellSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
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

        {/* Grid */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            width: gridWidth,
            marginTop: topSpace,
          }}
        >
          {weeks}
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
          {`${weeksLived.toLocaleString()} of ${TOTAL_WEEKS.toLocaleString()} weeks · (${weeksPercentage}%)`}
        </div>

      </div>
    ),
    {
      width,
      height,
    }
  )
}
