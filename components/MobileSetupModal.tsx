'use client'

import { useState, useEffect } from 'react'

const SIZE_PRESETS = [
  { name: 'iPhone 17 Pro Max', width: 1320, height: 2868 },
  { name: 'iPhone 17 Pro', width: 1206, height: 2622 },
  { name: 'iPhone 17 Plus', width: 1290, height: 2796 },
  { name: 'iPhone 17', width: 1179, height: 2556 },
  { name: 'iPhone 16 Pro Max', width: 1320, height: 2868 },
  { name: 'iPhone 16 Pro', width: 1206, height: 2622 },
  { name: 'iPhone 16 Plus', width: 1290, height: 2796 },
  { name: 'iPhone 16', width: 1179, height: 2556 },
  { name: 'iPhone 15 Pro Max', width: 1290, height: 2796 },
  { name: 'iPhone 15 Pro', width: 1179, height: 2556 },
  { name: 'iPhone 15 Plus', width: 1290, height: 2796 },
  { name: 'iPhone 15', width: 1179, height: 2556 },
  { name: 'iPhone 14 Pro Max', width: 1290, height: 2796 },
  { name: 'iPhone 14 Pro', width: 1179, height: 2556 },
  { name: 'iPhone 14 Plus', width: 1284, height: 2778 },
  { name: 'iPhone 14', width: 1170, height: 2532 },
  { name: 'iPhone SE (3rd gen)', width: 750, height: 1334 },
]

interface MobileSetupModalProps {
  isOpen: boolean
  onClose: () => void
  birthDate?: Date
  baseUrl: string
}

export function MobileSetupModal({ isOpen, onClose, birthDate, baseUrl }: MobileSetupModalProps) {
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [selectedModel, setSelectedModel] = useState(SIZE_PRESETS[0].name)
  const [copied, setCopied] = useState(false)

  // Pre-populate from birthDate prop
  useEffect(() => {
    if (birthDate) {
      setYear(birthDate.getFullYear().toString())
      setMonth(String(birthDate.getMonth() + 1).padStart(2, '0'))
      setDay(String(birthDate.getDate()).padStart(2, '0'))
    }
  }, [birthDate])

  // Generate the API URL
  const selectedPreset = SIZE_PRESETS.find(p => p.name === selectedModel) || SIZE_PRESETS[0]
  const birthDateStr = year && month && day ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` : ''
  const apiUrl = birthDateStr 
    ? `${baseUrl}/api/image?birthDate=${birthDateStr}&width=${selectedPreset.width}&height=${selectedPreset.height}`
    : ''

  const copyUrl = async () => {
    if (!apiUrl) return
    try {
      await navigator.clipboard.writeText(apiUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#1a1a1a]/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#faf8f5] border border-[#d4cfc8] shadow-2xl">
        <div className="p-6 md:p-8">
          {/* Header */}
          <h2 className="text-2xl font-semibold text-[#1a1a1a] mb-2">
            iOS Wallpaper Setup
          </h2>
          <p className="text-[#6b6560] text-sm mb-8 leading-relaxed">
            Set up an iOS Shortcut automation to automatically update your lock screen wallpaper daily with your life-in-weeks visualization.
          </p>

          {/* Step 1: Define Wallpaper */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-7 h-7 bg-[#1a1a1a] text-white text-sm font-mono rounded">
                1
              </span>
              <h3 className="text-[#1a1a1a] font-medium">Your Life in Weeks</h3>
            </div>

            {/* Birthday inputs */}
            <label className="block text-[#6b6560] text-xs font-mono tracking-wide mb-2">YOUR BIRTHDAY</label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <input
                type="text"
                placeholder="1987"
                value={year}
                onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="bg-white border border-[#d4cfc8] text-[#1a1a1a] px-3 py-3 text-center font-mono focus:outline-none focus:border-[#1a1a1a] transition-colors"
              />
              <input
                type="text"
                placeholder="03"
                value={month}
                onChange={(e) => setMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                className="bg-white border border-[#d4cfc8] text-[#1a1a1a] px-3 py-3 text-center font-mono focus:outline-none focus:border-[#1a1a1a] transition-colors"
              />
              <input
                type="text"
                placeholder="12"
                value={day}
                onChange={(e) => setDay(e.target.value.replace(/\D/g, '').slice(0, 2))}
                className="bg-white border border-[#d4cfc8] text-[#1a1a1a] px-3 py-3 text-center font-mono focus:outline-none focus:border-[#1a1a1a] transition-colors"
              />
            </div>

            {/* iPhone Model */}
            <label className="block text-[#6b6560] text-xs font-mono tracking-wide mb-2">IPHONE MODEL</label>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-white border border-[#d4cfc8] text-[#1a1a1a] px-3 py-3 font-mono appearance-none focus:outline-none focus:border-[#1a1a1a] transition-colors cursor-pointer"
              >
                {SIZE_PRESETS.map((preset) => (
                  <option key={preset.name} value={preset.name}>
                    {preset.name}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6560] pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Step 2: Create Automation */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-7 h-7 bg-[#1a1a1a] text-white text-sm font-mono rounded">
                2
              </span>
              <h3 className="text-[#1a1a1a] font-medium">Shortcuts App</h3>
            </div>

            <p className="text-[#6b6560] text-sm leading-relaxed">
              Open <span className="underline">Shortcuts</span> app → Go to <span className="text-[#1a1a1a]">Automation</span> tab → New Automation → <span className="underline">Time of Day</span> → <span className="text-[#c45d3a]">00:00</span> → Repeat <span className="text-[#c45d3a]">&quot;Daily&quot;</span> → Select <span className="text-[#c45d3a]">&quot;Run Immediately&quot;</span> → <span className="text-[#c45d3a]">&quot;Next&quot;</span>
            </p>
          </div>

          {/* Step 3: Create Shortcut */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-7 h-7 bg-[#1a1a1a] text-white text-sm font-mono rounded">
                3
              </span>
              <h3 className="text-[#1a1a1a] font-medium">Create New Shortcut</h3>
            </div>

            <p className="text-[#a8a29e] text-xs font-mono uppercase tracking-wide mb-3">ADD THESE ACTIONS:</p>
            
            <div className="space-y-3 text-sm text-[#6b6560]">
              <p>
                3.1 <span className="text-[#1a1a1a]">&quot;Get Contents of URL&quot;</span> → paste the following URL there:
              </p>
              
              {/* URL display with copy button */}
              <div className="flex items-center gap-2 bg-white border border-[#d4cfc8] p-3">
                <span className="flex-1 text-[#a8a29e] text-xs font-mono truncate">
                  {apiUrl || 'Enter birthday above...'}
                </span>
                <button
                  onClick={copyUrl}
                  disabled={!apiUrl}
                  className="p-1.5 hover:bg-[#f5f3f0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Copy URL"
                >
                  {copied ? (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-[#6b6560]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>

              <p>
                3.2 <span className="text-[#1a1a1a]">&quot;Set Wallpaper Photo&quot;</span> → choose <span className="text-[#1a1a1a]">&quot;Lock Screen&quot;</span>
              </p>
            </div>
          </div>

          {/* Warning box */}
          <div className="bg-white border border-[#c45d3a]/30 p-4 mb-8">
            <p className="text-[#c45d3a] text-sm leading-relaxed">
              <span className="font-semibold">Important:</span> In &quot;Set Wallpaper Photo&quot;, tap the arrow (→) to show options → disable both <span className="font-semibold text-[#1a1a1a]">&quot;Crop to Subject&quot;</span> and <span className="font-semibold text-[#1a1a1a]">&quot;Show Preview&quot;</span>
            </p>
            <p className="text-[#a8a29e] text-xs mt-2">
              This prevents iOS from cropping and asking for confirmation each time
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full text-center py-3 bg-[#1a1a1a] text-white font-mono text-sm tracking-wide hover:bg-[#333] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
