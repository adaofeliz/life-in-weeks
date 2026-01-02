'use client'

import { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from 'react'
import {
  TOTAL_YEARS,
  WEEKS_PER_YEAR,
  colors,
  calculateWeeksLived,
  calculateGridLayout,
  getWeekColor,
  getFadedWeekColor,
} from '@/lib/life-in-weeks'
import { MobileSetupModal } from './MobileSetupModal'
import { CopyIcon, CheckIcon, DownloadIcon, PhoneIcon, MonitorIcon } from './Icons'

export interface LifeInWeeksCanvasRef {
  downloadImage: () => void
  copyLink: () => Promise<void>
  openMobileModal: () => void
}

interface LifeInWeeksCanvasProps {
  birthDate: Date
  width?: number
  height?: number
  onWallpaperMode?: () => void
  hideControls?: boolean
}

// Canvas-specific top space ratio (smaller for balanced frame appearance)
const CANVAS_TOP_SPACE_RATIO = 0.05

export const LifeInWeeksCanvas = forwardRef<LifeInWeeksCanvasRef, LifeInWeeksCanvasProps>(function LifeInWeeksCanvas({
  birthDate,
  width = 800,
  height = 1000,
  onWallpaperMode,
  hideControls = false,
}, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredWeek, setHoveredWeek] = useState<{ year: number; week: number } | null>(null)
  const [dimensions, setDimensions] = useState({ width, height })
  const [copied, setCopied] = useState(false)
  const [showMobileModal, setShowMobileModal] = useState(false)
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
    ctx.fillStyle = colors.background
    ctx.fillRect(0, 0, displayWidth, displayHeight)

    // Calculate grid layout using shared function
    const layout = calculateGridLayout(displayWidth, displayHeight, CANVAS_TOP_SPACE_RATIO)
    const { startX, startY, cellSize, boxSize, borderRadius, topSpace } = layout

    // Store grid info for hover detection
    gridInfoRef.current = { startX, startY, cellSize, boxSize }

    // Draw title
    ctx.fillStyle = colors.textPrimary
    ctx.font = `600 ${Math.max(16, displayHeight * 0.022)}px var(--font-crimson), Georgia, serif`
    ctx.textAlign = 'center'
    ctx.fillText('YOUR LIFE IN WEEKS', displayWidth / 2, topSpace * 0.55)

    // Draw grid
    for (let year = 0; year < TOTAL_YEARS; year++) {
      for (let week = 0; week < WEEKS_PER_YEAR; week++) {
        const weekNumber = year * WEEKS_PER_YEAR + week

        const x = startX + week * cellSize + (cellSize - boxSize) / 2
        const y = startY + year * cellSize + (cellSize - boxSize) / 2

        const isHovered = hoveredWeek?.year === year && hoveredWeek?.week === week
        
        // Use shared color logic
        const baseColor = getWeekColor(weekNumber, weeksLived, isHovered)
        const isCurrentWeek = weekNumber === weeksLived
        
        if (!isCurrentWeek && !isHovered) {
          if (weekNumber < weeksLived) {
            // Apply fading effect for older weeks (past 10 years fade toward background)
            ctx.fillStyle = getFadedWeekColor(weekNumber, weeksLived, colors.lived, colors.background)
          } else {
            ctx.fillStyle = colors.remaining
          }
        } else {
          ctx.fillStyle = baseColor
        }

        // Draw rounded rectangle
        ctx.beginPath()
        ctx.roundRect(x, y, boxSize, boxSize, borderRadius)
        ctx.fill()
      }
    }

    // Draw year markers
    ctx.fillStyle = colors.textMuted
    ctx.font = `${Math.max(9, displayHeight * 0.01)}px var(--font-mono), monospace`
    ctx.textAlign = 'right'

    for (let year = 0; year <= TOTAL_YEARS; year += 10) {
      if (year < TOTAL_YEARS) {
        const y = startY + year * cellSize + cellSize / 2 + 3
        ctx.fillText(year.toString(), startX - 8, y)
      }
    }

    // Draw "90" at the bottom
    ctx.fillText('90', startX - 8, startY + TOTAL_YEARS * cellSize)

  }, [dimensions, weeksLived, birthDate, hoveredWeek])

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

  const openMobileModal = () => setShowMobileModal(true)

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    downloadImage,
    copyLink,
    openMobileModal,
  }))

  // Calculate current week position (the week being lived right now)
  const currentYear = Math.floor(weeksLived / WEEKS_PER_YEAR)
  const currentWeek = weeksLived % WEEKS_PER_YEAR
  
  // Use hovered week if hovering, otherwise show current week
  const displayYear = hoveredWeek?.year ?? currentYear
  const displayWeek = hoveredWeek?.week ?? currentWeek
  const weekNumber = displayYear * WEEKS_PER_YEAR + displayWeek
  const isCurrentWeekDisplay = !hoveredWeek

  return (
    <div ref={containerRef} className="w-full">
      {/* Week indicator - centered between border and canvas */}
      <div className="text-center mt-4 mb-4 font-mono text-sm text-[#6b6560]">
        Year {displayYear}, Week {displayWeek + 1}
        {weekNumber < weeksLived ? (
          <span className="ml-2 text-[#1a1a1a]">• Lived</span>
        ) : weekNumber === weeksLived ? (
          <span className="ml-2 text-[#c45d3a]">• Now{isCurrentWeekDisplay ? '' : ' (current)'}</span>
        ) : (
          <span className="ml-2 text-[#a8a29e]">• Ahead</span>
        )}
      </div>

      {/* Controls - conditionally rendered */}
      {!hideControls && (
        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            onClick={copyLink}
            title="Copy link"
            className="p-3 bg-[#1a1a1a] text-white hover:bg-[#333] transition-colors"
          >
            {copied ? (
              <CheckIcon className="w-5 h-5 text-green-400" />
            ) : (
              <CopyIcon />
            )}
          </button>
          <button
            onClick={downloadImage}
            title="Download PNG"
            className="p-3 bg-[#1a1a1a] text-white hover:bg-[#333] transition-colors"
          >
            <DownloadIcon />
          </button>
          <button
            onClick={openMobileModal}
            title="iOS wallpaper setup"
            className="p-3 bg-[#1a1a1a] text-white hover:bg-[#333] transition-colors"
          >
            <PhoneIcon />
          </button>
          {onWallpaperMode && (
            <button
              onClick={onWallpaperMode}
              title="Web wallpaper mode"
              className="p-3 bg-[#1a1a1a] text-white hover:bg-[#333] transition-colors"
            >
              <MonitorIcon />
            </button>
          )}
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="cursor-crosshair mx-auto block mb-12"
        style={{ maxWidth: '100%' }}
      />

      {/* Mobile Setup Modal */}
      <MobileSetupModal
        isOpen={showMobileModal}
        onClose={() => setShowMobileModal(false)}
        birthDate={birthDate}
        baseUrl={typeof window !== 'undefined' ? window.location.origin : ''}
      />
    </div>
  )
})

// Standalone controls component for use outside the canvas
interface LifeInWeeksControlsProps {
  canvasRef: React.RefObject<LifeInWeeksCanvasRef | null>
  onWallpaperMode?: () => void
}

export function LifeInWeeksControls({ canvasRef, onWallpaperMode }: LifeInWeeksControlsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    await canvasRef.current?.copyLink()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={handleCopyLink}
        title="Copy link"
        className="p-3 bg-[#1a1a1a] text-white hover:bg-[#333] transition-colors"
      >
        {copied ? (
          <CheckIcon className="w-5 h-5 text-green-400" />
        ) : (
          <CopyIcon />
        )}
      </button>
      <button
        onClick={() => canvasRef.current?.downloadImage()}
        title="Download PNG"
        className="p-3 bg-[#1a1a1a] text-white hover:bg-[#333] transition-colors"
      >
        <DownloadIcon />
      </button>
      <button
        onClick={() => canvasRef.current?.openMobileModal()}
        title="iOS wallpaper setup"
        className="p-3 bg-[#1a1a1a] text-white hover:bg-[#333] transition-colors"
      >
        <PhoneIcon />
      </button>
      {onWallpaperMode && (
        <button
          onClick={onWallpaperMode}
          title="Web wallpaper mode"
          className="p-3 bg-[#1a1a1a] text-white hover:bg-[#333] transition-colors"
        >
          <MonitorIcon />
        </button>
      )}
    </div>
  )
}
