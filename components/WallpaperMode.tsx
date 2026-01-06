'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import {
  TOTAL_YEARS,
  WEEKS_PER_YEAR,
  calculateWeeksLived,
  calculateGridLayout,
  getFadedWeekColor,
  calculateLifeStats,
} from '@/lib/life-in-weeks'
import { useThemeColors } from '@/lib/use-theme-colors'
import { CloseIcon } from './Icons'

interface WallpaperModeProps {
  birthDate: Date
  onExit: () => void
}

// Minimal top space for wallpaper mode (just the grid, no title)
const WALLPAPER_TOP_SPACE_RATIO = 0.02

export function WallpaperMode({ birthDate, onExit }: WallpaperModeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [stats, setStats] = useState(() => calculateLifeStats(birthDate))

  const colors = useThemeColors()

  // Update stats every second for real-time counter
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(calculateLifeStats(birthDate))
    }, 1000)
    return () => clearInterval(interval)
  }, [birthDate])

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
    ctx.fillStyle = colors.background
    ctx.fillRect(0, 0, displayWidth, displayHeight)

    // Calculate grid layout
    const layout = calculateGridLayout(displayWidth, displayHeight, WALLPAPER_TOP_SPACE_RATIO)
    const { startX, startY, cellSize, boxSize, borderRadius } = layout

    // Draw grid
    for (let year = 0; year < TOTAL_YEARS; year++) {
      for (let week = 0; week < WEEKS_PER_YEAR; week++) {
        const weekNumber = year * WEEKS_PER_YEAR + week

        const x = startX + week * cellSize + (cellSize - boxSize) / 2
        const y = startY + year * cellSize + (cellSize - boxSize) / 2

        const isCurrentWeek = weekNumber === weeksLived
        if (isCurrentWeek) {
          ctx.fillStyle = colors.current
        } else if (weekNumber < weeksLived) {
          ctx.fillStyle = getFadedWeekColor(weekNumber, weeksLived, colors.lived, colors.background)
        } else {
          ctx.fillStyle = colors.remaining
        }

        ctx.beginPath()
        ctx.roundRect(x, y, boxSize, boxSize, borderRadius)
        ctx.fill()
      }
    }

    // Draw year markers
    ctx.fillStyle = colors.textMuted
    ctx.font = `${Math.max(9, displayHeight * 0.012)}px var(--font-mono), monospace`
    ctx.textAlign = 'right'

    for (let year = 0; year <= TOTAL_YEARS; year += 10) {
      if (year < TOTAL_YEARS) {
        const y = startY + year * cellSize + cellSize / 2 + 3
        ctx.fillText(year.toString(), startX - 8, y)
      }
    }
    ctx.fillText('90', startX - 8, startY + TOTAL_YEARS * cellSize)
  }, [dimensions, weeksLived, colors])

  // Calculate dimensions based on viewport
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return

      const viewportHeight = window.innerHeight
      const counterHeight = 80 // Space for the counter below
      const padding = 32 // Total vertical padding
      const availableHeight = viewportHeight - counterHeight - padding

      // Calculate width based on aspect ratio of the grid (52 weeks / 90 years)
      const gridAspectRatio = WEEKS_PER_YEAR / TOTAL_YEARS
      const calculatedWidth = availableHeight * gridAspectRatio * 1.15 // Add padding compensation

      // Constrain to viewport width
      const maxWidth = window.innerWidth - 40
      const finalWidth = Math.min(calculatedWidth, maxWidth)
      const finalHeight = finalWidth / gridAspectRatio / 1.15

      setDimensions({
        width: Math.floor(finalWidth),
        height: Math.floor(Math.min(finalHeight, availableHeight)),
      })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    drawGrid()
  }, [drawGrid])

  // Format number with commas
  const formatNumber = (num: number) => num.toLocaleString()

  // Calculate precise percentage based on seconds (for real-time ticking)
  const totalSecondsIn90Years = TOTAL_YEARS * 365.25 * 24 * 60 * 60
  const precisePercentage = (stats.secondsLived / totalSecondsIn90Years) * 100

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: colors.background }}
    >
      {/* Exit button - top right */}
      <button
        onClick={onExit}
        className="absolute top-4 right-4 p-2 rounded-full opacity-30 hover:opacity-70 transition-opacity"
        title="Exit wallpaper mode"
        style={{ color: colors.textSecondary }}
      >
        <CloseIcon />
      </button>
    
      {/* Real-time counter */}
      <div 
        className="font-mono text-xs sm:text-sm tracking-wide text-center px-4 flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5"
        style={{ color: colors.textSecondary }}
      >
        <span className="whitespace-nowrap">
          <span className="tabular-nums">{formatNumber(stats.secondsLived)}</span>
          <span className="ml-0.5 opacity-50">sec</span>
        </span>
        <span className="opacity-30">·</span>
        <span className="whitespace-nowrap">
          <span className="tabular-nums">{formatNumber(stats.minutesLived)}</span>
          <span className="ml-0.5 opacity-50">min</span>
        </span>
        <span className="opacity-30">·</span>
        <span className="whitespace-nowrap">
          <span className="tabular-nums">{formatNumber(stats.hoursLived)}</span>
          <span className="ml-0.5 opacity-50">hrs</span>
        </span>
        <span className="opacity-30">·</span>
        <span className="whitespace-nowrap">
          <span className="tabular-nums">{formatNumber(stats.daysLived)}</span>
          <span className="ml-0.5 opacity-50">days</span>
        </span>
        <span className="opacity-30">·</span>
        <span className="whitespace-nowrap">
          <span className="tabular-nums">{formatNumber(stats.weeksLived)}</span>
          <span className="ml-0.5 opacity-50">wks</span>
        </span>
        <span className="opacity-30">·</span>
        <span className="whitespace-nowrap">
          <span className="tabular-nums">{formatNumber(stats.monthsLived)}</span>
          <span className="ml-0.5 opacity-50">mos</span>
        </span>
        <span className="opacity-30">·</span>
        <span className="whitespace-nowrap">
          <span className="tabular-nums">{stats.yearsLived.toFixed(2)}</span>
          <span className="ml-0.5 opacity-50">yrs</span>
        </span>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="block"
        style={{ maxWidth: '100%' }}
      />

      {/* Life in Weeks lived Percentage */}
      <div className="font-mono text-sm tracking-wide text-center" style={{ color: colors.textSecondary }}>   
          <span className="tabular-nums">{precisePercentage.toFixed(8)}</span>
          <span className="ml-1 opacity-50">%</span>
      </div>
    </div>
  )
}
