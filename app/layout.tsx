import type { Metadata } from 'next'
import { Crimson_Pro, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-crimson',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Your Life in Weeks',
  description: 'A visual representation of your life in weeks, inspired by Tim Urban\'s Wait But Why post. See how many weeks you\'ve lived and how many remain.',
  openGraph: {
    title: 'Your Life in Weeks',
    description: 'Visualize your entire life as a grid of weeks. Each box is one week.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${crimsonPro.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
