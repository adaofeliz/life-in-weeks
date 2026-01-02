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

const SIZE_PRESETS = [
  { name: 'iPhone Pro Max', width: 1320, height: 2868 },
  { name: 'iPhone Pro', width: 1218, height: 2634 },
  { name: 'iPhone Plus / Air', width: 1290, height: 2796 },
  { name: 'iPhone 14', width: 1170, height: 2532 },
  { name: 'iPhone SE', width: 750, height: 1334 }
]

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
  const [copied, setCopied] = useState(false)
  const [copiedImageLink, setCopiedImageLink] = useState(false)
  const [showSizeMenu, setShowSizeMenu] = useState(false)
  const sizeMenuRef = useRef<HTMLDivElement>(null)
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

  const copyLink = async () => {
    const dateStr = birthDate.toISOString().split('T')[0]
    const url = `${window.location.origin}?birthDate=${dateStr}`
    
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const copyImageLink = async (preset: typeof SIZE_PRESETS[0]) => {
    const dateStr = birthDate.toISOString().split('T')[0]
    const url = `${window.location.origin}/api/image?birthDate=${dateStr}&width=${preset.width}&height=${preset.height}`
    
    try {
      await navigator.clipboard.writeText(url)
      setCopiedImageLink(true)
      setTimeout(() => setCopiedImageLink(false), 2000)
    } catch (err) {
      console.error('Failed to copy image link:', err)
    }
    
    setShowSizeMenu(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sizeMenuRef.current && !sizeMenuRef.current.contains(event.target as Node)) {
        setShowSizeMenu(false)
      }
    }

    if (showSizeMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSizeMenu])

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
      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          onClick={downloadImage}
          title="Download PNG"
          className="p-3 bg-[#1a1a1a] text-white hover:bg-[#333] transition-colors"
        >
          <svg
            className="w-5 h-5"
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
        </button>
        <button
          onClick={copyLink}
          title="Copy link"
          className="p-3 bg-[#1a1a1a] text-white hover:bg-[#333] transition-colors"
        >
          {copied ? (
            <svg
              className="w-5 h-5 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          )}
        </button>
        <div className="relative" ref={sizeMenuRef}>
          <button
            onClick={() => setShowSizeMenu(!showSizeMenu)}
            title="Copy image link for device"
            className="p-3 bg-[#1a1a1a] text-white hover:bg-[#333] transition-colors"
          >
            {copiedImageLink ? (
              <svg
                className="w-5 h-5 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            )}
          </button>
          {showSizeMenu && (
            <div className="absolute bottom-full mb-2 right-0 bg-white border border-[#d4cfc8] shadow-lg z-10 min-w-[220px]">
              <div className="px-3 py-2 text-xs font-mono text-[#6b6560] border-b border-[#d4cfc8]">
                COPY IMAGE LINK
              </div>
              {SIZE_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => copyImageLink(preset)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-[#f5f3f0] transition-colors flex justify-between items-center"
                >
                  <span className="text-[#1a1a1a]">{preset.name}</span>
                  <span className="text-xs font-mono text-[#a8a29e]">
                    {preset.width}×{preset.height}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
