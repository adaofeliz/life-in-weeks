'use client'

import { useRef, useEffect, useCallback, useState } from 'react'

interface LifeInWeeksCanvasProps {
  birthDate: Date
  livedColor?: string
  remainingColor?: string
  width?: number
  height?: number
}

const TOTAL_YEARS = 90
const WEEKS_PER_YEAR = 52
const TOTAL_WEEKS = TOTAL_YEARS * WEEKS_PER_YEAR

export function calculateWeeksLived(birthDate: Date): number {
  const today = new Date()
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const weeksLived = Math.floor((today.getTime() - birthDate.getTime()) / msPerWeek)
  return Math.min(Math.max(0, weeksLived), TOTAL_WEEKS)
}

export function LifeInWeeksCanvas({
  birthDate,
  livedColor = '#1a1a1a',
  remainingColor = '#e8e4df',
  width = 800,
  height = 1000,
}: LifeInWeeksCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredWeek, setHoveredWeek] = useState<{ year: number; week: number } | null>(null)
  const [dimensions, setDimensions] = useState({ width, height })
  const gridInfoRef = useRef<{
    startX: number
    startY: number
    cellSize: number
    boxSize: number
  } | null>(null)

  const weeksLived = calculateWeeksLived(birthDate)

  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const displayWidth = dimensions.width
    const displayHeight = dimensions.height

    canvas.width = displayWidth * dpr
    canvas.height = displayHeight * dpr
    canvas.style.width = `${displayWidth}px`
    canvas.style.height = `${displayHeight}px`
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.fillStyle = '#faf8f5'
    ctx.fillRect(0, 0, displayWidth, displayHeight)

    const cols = WEEKS_PER_YEAR
    const rows = TOTAL_YEARS

    // Padding
    const paddingX = displayWidth * 0.06
    const paddingY = displayHeight * 0.04
    const topSpace = displayHeight * 0.08

    const availableWidth = displayWidth - 2 * paddingX
    const availableHeight = displayHeight - paddingY - topSpace

    const cellWidth = availableWidth / cols
    const cellHeight = availableHeight / rows
    const cellSize = Math.min(cellWidth, cellHeight)

    const spacingRatio = 0.18
    const boxSize = cellSize * (1 - spacingRatio)

    const gridWidth = cols * cellSize
    const gridHeight = rows * cellSize

    const startX = (displayWidth - gridWidth) / 2
    const startY = topSpace

    // Store grid info for hover detection
    gridInfoRef.current = { startX, startY, cellSize, boxSize }

    // Draw title
    ctx.fillStyle = '#1a1a1a'
    ctx.font = `600 ${Math.max(16, displayHeight * 0.022)}px var(--font-crimson), Georgia, serif`
    ctx.textAlign = 'center'
    ctx.fillText('YOUR LIFE IN WEEKS', displayWidth / 2, topSpace * 0.4)

    // Draw subtitle
    ctx.fillStyle = '#6b6560'
    ctx.font = `${Math.max(11, displayHeight * 0.013)}px var(--font-mono), monospace`
    const formattedDate = birthDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    ctx.fillText(
      `Born ${formattedDate} · ${weeksLived.toLocaleString()} of ${TOTAL_WEEKS.toLocaleString()} weeks`,
      displayWidth / 2,
      topSpace * 0.65
    )

    // Draw grid
    for (let year = 0; year < rows; year++) {
      for (let week = 0; week < cols; week++) {
        const weekNumber = year * WEEKS_PER_YEAR + week

        const x = startX + week * cellSize + (cellSize - boxSize) / 2
        const y = startY + year * cellSize + (cellSize - boxSize) / 2

        const isHovered = hoveredWeek?.year === year && hoveredWeek?.week === week
        const isCurrentWeek = weekNumber === weeksLived

        if (isCurrentWeek) {
          // Current week - accent color (same as "Now")
          ctx.fillStyle = '#c45d3a'
        } else if (weekNumber < weeksLived) {
          ctx.fillStyle = isHovered ? '#c45d3a' : livedColor
        } else {
          ctx.fillStyle = isHovered ? '#d4cfc8' : remainingColor
        }

        // Draw rounded rectangle
        const radius = Math.max(1, boxSize * 0.15)
        ctx.beginPath()
        ctx.roundRect(x, y, boxSize, boxSize, radius)
        ctx.fill()
      }
    }

    // Draw year markers
    ctx.fillStyle = '#a8a29e'
    ctx.font = `${Math.max(9, displayHeight * 0.01)}px var(--font-mono), monospace`
    ctx.textAlign = 'right'

    for (let year = 0; year <= TOTAL_YEARS; year += 10) {
      if (year < TOTAL_YEARS) {
        const y = startY + year * cellSize + cellSize / 2 + 3
        ctx.fillText(year.toString(), startX - 8, y)
      }
    }

    // Draw "90" at the bottom
    ctx.fillText('90', startX - 8, startY + rows * cellSize)

  }, [dimensions, weeksLived, livedColor, remainingColor, birthDate, hoveredWeek])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const gridInfo = gridInfoRef.current
    if (!canvas || !gridInfo) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const { startX, startY, cellSize } = gridInfo

    const col = Math.floor((x - startX) / cellSize)
    const row = Math.floor((y - startY) / cellSize)

    if (col >= 0 && col < WEEKS_PER_YEAR && row >= 0 && row < TOTAL_YEARS) {
      setHoveredWeek({ year: row, week: col })
    } else {
      setHoveredWeek(null)
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHoveredWeek(null)
  }, [])

  useEffect(() => {
    drawGrid()
  }, [drawGrid])

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth
        const newWidth = Math.min(containerWidth, 900)
        const newHeight = newWidth * 1.25
        setDimensions({ width: newWidth, height: newHeight })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const downloadImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `life-in-weeks-${birthDate.toISOString().split('T')[0]}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div ref={containerRef} className="w-full">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="cursor-crosshair mx-auto block"
        style={{ maxWidth: '100%' }}
      />
      {(() => {
        // Calculate current week position (the week being lived right now)
        const currentYear = Math.floor(weeksLived / WEEKS_PER_YEAR)
        const currentWeek = weeksLived % WEEKS_PER_YEAR
        
        // Use hovered week if hovering, otherwise show current week
        const displayYear = hoveredWeek?.year ?? currentYear
        const displayWeek = hoveredWeek?.week ?? currentWeek
        const weekNumber = displayYear * WEEKS_PER_YEAR + displayWeek
        const isCurrentWeek = !hoveredWeek
        
        return (
          <div className="text-center mt-4 font-mono text-sm text-[#6b6560]">
            Year {displayYear + 1}, Week {displayWeek + 1}
            {weekNumber < weeksLived ? (
              <span className="ml-2 text-[#1a1a1a]">• Lived</span>
            ) : weekNumber === weeksLived ? (
              <span className="ml-2 text-[#c45d3a]">• Now{isCurrentWeek ? '' : ' (current)'}</span>
            ) : (
              <span className="ml-2 text-[#a8a29e]">• Ahead</span>
            )}
          </div>
        )
      })()}
      <div className="text-center mt-6">
        <button
          onClick={downloadImage}
          className="btn-primary inline-flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white font-mono text-sm tracking-wide hover:bg-[#333] transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download PNG
        </button>
      </div>
    </div>
  )
}
