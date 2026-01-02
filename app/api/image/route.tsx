import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'

const TOTAL_YEARS = 90
const WEEKS_PER_YEAR = 52
const TOTAL_WEEKS = TOTAL_YEARS * WEEKS_PER_YEAR

function calculateWeeksLived(birthDate: Date): number {
  const today = new Date()
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const weeksLived = Math.floor((today.getTime() - birthDate.getTime()) / msPerWeek)
  return Math.min(Math.max(0, weeksLived), TOTAL_WEEKS)
}

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

  // Calculate grid dimensions
  const paddingX = width * 0.06
  const topSpace = height * 0.25
  const paddingY = height * 0.04

  const availableWidth = width - 2 * paddingX
  const availableHeight = height - paddingY - topSpace

  const cellWidth = availableWidth / WEEKS_PER_YEAR
  const cellHeight = availableHeight / TOTAL_YEARS
  const cellSize = Math.min(cellWidth, cellHeight)

  const spacingRatio = 0.18
  const boxSize = cellSize * (1 - spacingRatio)
  const gap = cellSize - boxSize

  const gridWidth = WEEKS_PER_YEAR * cellSize
  const startX = (width - gridWidth) / 2

  // Generate week cells - wrap each box in a cell container to center it (matching canvas behavior)
  const weeks = []
  for (let year = 0; year < TOTAL_YEARS; year++) {
    for (let week = 0; week < WEEKS_PER_YEAR; week++) {
      const weekNumber = year * WEEKS_PER_YEAR + week
      const isCurrentWeek = weekNumber === weeksLived

      let color: string
      if (isCurrentWeek) {
        color = '#c45d3a'
      } else if (weekNumber < weeksLived) {
        color = '#1a1a1a'
      } else {
        color = '#e8e4df'
      }

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
              borderRadius: Math.max(1, boxSize * 0.15),
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
          color: '#a8a29e',
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
          backgroundColor: '#faf8f5',
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
            marginTop: 35,
            fontSize: Math.max(11, height * 0.013),
            color: '#6b6560',
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
