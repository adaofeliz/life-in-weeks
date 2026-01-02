'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { LifeInWeeksCanvas, calculateWeeksLived } from '@/components/LifeInWeeksCanvas'

const TOTAL_WEEKS = 90 * 52

interface Stats {
  weeksLived: number
  weeksRemaining: number
  percentageLived: number
  yearsLived: number
  daysLived: number
}

function calculateStats(birthDate: Date): Stats {
  const today = new Date()
  const msPerDay = 24 * 60 * 60 * 1000
  const daysLived = Math.floor((today.getTime() - birthDate.getTime()) / msPerDay)
  const weeksLived = calculateWeeksLived(birthDate)
  const weeksRemaining = Math.max(0, TOTAL_WEEKS - weeksLived)
  const yearsLived = daysLived / 365.25
  const percentageLived = (weeksLived / TOTAL_WEEKS) * 100

  return {
    weeksLived,
    weeksRemaining,
    percentageLived,
    yearsLived,
    daysLived,
  }
}

function HomeContent() {
  const searchParams = useSearchParams()
  const [birthDateInput, setBirthDateInput] = useState('')
  const [birthDate, setBirthDate] = useState<Date | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Handle birthDate from URL query params
  useEffect(() => {
    const birthDateParam = searchParams.get('birthDate')
    if (birthDateParam) {
      const date = new Date(birthDateParam + 'T00:00:00')
      const today = new Date()

      if (!isNaN(date.getTime()) && date <= today) {
        const yearsAgo = (today.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
        if (yearsAgo <= 90) {
          setBirthDateInput(birthDateParam)
          setBirthDate(date)
          setStats(calculateStats(date))
        }
      }
    }
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!birthDateInput) {
      setError('Please enter your birth date')
      return
    }

    const date = new Date(birthDateInput + 'T00:00:00')
    const today = new Date()

    if (isNaN(date.getTime())) {
      setError('Invalid date format')
      return
    }

    if (date > today) {
      setError('Birth date must be in the past')
      return
    }

    const yearsAgo = (today.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    if (yearsAgo > 90) {
      setError('Birth date cannot be more than 90 years ago')
      return
    }

    setBirthDate(date)
    setStats(calculateStats(date))
  }

  return (
    <main className="noise-bg min-h-screen">
      {/* Hero Section */}
      <section className="relative px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6 text-[#1a1a1a]">
              Your Life in Weeks
            </h1>
            <p className="text-lg md:text-xl text-[#6b6560] max-w-2xl mx-auto mb-4 leading-relaxed">
              A visual representation of a 90-year human life. Each box is one week.
              <span className="block mt-2 text-base italic">
                Inspired by Tim Urban&apos;s{' '}
                <a
                  href="https://waitbutwhy.com/2014/05/life-weeks.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#c45d3a] hover:underline"
                >
                  Wait But Why
                </a>{' '}
                post.
              </span>
            </p>
          </div>

          {/* Form */}
          <div
            className={`mt-12 transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <label className="block text-sm font-mono text-[#6b6560] mb-3 tracking-wide">
                ENTER YOUR BIRTH DATE
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="date"
                  value={birthDateInput}
                  onChange={(e) => setBirthDateInput(e.target.value)}
                  className="flex-1 px-4 py-3 border border-[#d4cfc8] bg-white text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] transition-colors font-mono"
                  max={new Date().toISOString().split('T')[0]}
                />
                <button
                  type="submit"
                  className="btn-primary px-8 py-3 bg-[#1a1a1a] text-white font-mono text-sm tracking-wide hover:bg-[#333] transition-colors"
                >
                  Generate
                </button>
              </div>
              {error && (
                <p className="mt-3 text-[#c45d3a] text-sm font-mono">{error}</p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {birthDate && stats && (
        <section className="px-6 pb-24 animate-fade-in">
          <div className="max-w-5xl mx-auto">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <div className="stat-card">
                <div className="text-3xl md:text-4xl font-semibold text-[#1a1a1a] mb-1">
                  {stats.weeksLived.toLocaleString()}
                </div>
                <div className="text-sm font-mono text-[#6b6560] tracking-wide">
                  WEEKS LIVED
                </div>
              </div>
              <div className="stat-card">
                <div className="text-3xl md:text-4xl font-semibold text-[#c45d3a] mb-1">
                  {stats.weeksRemaining.toLocaleString()}
                </div>
                <div className="text-sm font-mono text-[#6b6560] tracking-wide">
                  WEEKS REMAINING
                </div>
              </div>
              <div className="stat-card">
                <div className="text-3xl md:text-4xl font-semibold text-[#1a1a1a] mb-1">
                  {stats.percentageLived.toFixed(1)}%
                </div>
                <div className="text-sm font-mono text-[#6b6560] tracking-wide">
                  OF 90 YEARS
                </div>
              </div>
              <div className="stat-card">
                <div className="text-3xl md:text-4xl font-semibold text-[#1a1a1a] mb-1">
                  {stats.yearsLived.toFixed(1)}
                </div>
                <div className="text-sm font-mono text-[#6b6560] tracking-wide">
                  YEARS OLD
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-12">
              <div className="h-2 bg-[#e8e4df] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1a1a1a] transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(100, stats.percentageLived)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs font-mono text-[#a8a29e]">
                <span>Birth</span>
                <span>90 years</span>
              </div>
            </div>

            {/* Canvas */}
            <div className="bg-white border border-[#d4cfc8] p-6 md:p-10">
              <LifeInWeeksCanvas birthDate={birthDate} />
            </div>

            {/* Quote */}
            <div className="mt-16 text-center max-w-2xl mx-auto">
              <blockquote className="text-xl md:text-2xl italic text-[#6b6560] leading-relaxed">
                &ldquo;The trouble is, you think you have time.&rdquo;
              </blockquote>
              <cite className="block mt-4 text-sm font-mono text-[#a8a29e]">
                — Jack Kornfield
              </cite>
            </div>
          </div>
        </section>
      )}

      {/* Pre-submit Info Section */}
      {!birthDate && (
        <section
          className={`px-6 pb-24 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="p-6">
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-[#1a1a1a]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">4,680 Weeks</h3>
                <p className="text-[#6b6560] text-sm leading-relaxed">
                  That&apos;s how many weeks are in 90 years. Each tiny square represents one week of your life.
                </p>
              </div>
              <div className="p-6">
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-[#1a1a1a]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Visual Clarity</h3>
                <p className="text-[#6b6560] text-sm leading-relaxed">
                  See your past and future laid out as a simple grid. Dark squares are weeks you&apos;ve lived.
                </p>
              </div>
              <div className="p-6">
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-[#1a1a1a]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Download</h3>
                <p className="text-[#6b6560] text-sm leading-relaxed">
                  Save your personalized life chart as a high-quality PNG to print or share.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-[#d4cfc8] px-6 py-8">
        <div className="max-w-4xl mx-auto text-center text-sm text-[#a8a29e] font-mono">
          <p>
            Made with{' '}
            <a
              href="https://github.com/adaofeliz/life-in-weeks"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#6b6560] transition-colors"
            >
              care
            </a>
            {' '}· Inspired by{' '}
            <a
              href="https://waitbutwhy.com/2014/05/life-weeks.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6b6560] hover:text-[#1a1a1a] transition-colors"
            >
              Wait But Why
            </a>
          </p>
        </div>
      </footer>
    </main>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <main className="noise-bg min-h-screen flex items-center justify-center">
        <div className="text-[#6b6560] font-mono">Loading...</div>
      </main>
    }>
      <HomeContent />
    </Suspense>
  )
}
