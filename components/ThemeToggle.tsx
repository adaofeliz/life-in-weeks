'use client'

import { useTheme } from './ThemeProvider'
import { SunIcon, MoonIcon } from './Icons'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full transition-colors hover:bg-[var(--color-border)] ${className}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <SunIcon className="w-5 h-5 text-[var(--color-text-secondary)]" />
      ) : (
        <MoonIcon className="w-5 h-5 text-[var(--color-text-secondary)]" />
      )}
    </button>
  )
}
