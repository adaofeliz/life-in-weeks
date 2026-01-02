import { NextRequest, NextResponse } from 'next/server'
import {
  TOTAL_WEEKS,
  parseBirthDate,
  validateBirthDate,
  calculateLifeStats,
} from '@/lib/life-in-weeks'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const birthDateParam = searchParams.get('birthDate')

  if (!birthDateParam) {
    return NextResponse.json(
      { error: 'birthDate parameter is required (format: YYYY-MM-DD)' },
      { status: 400 }
    )
  }

  const birthDate = parseBirthDate(birthDateParam)
  const validation = validateBirthDate(birthDate)

  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  const stats = calculateLifeStats(birthDate)
  const today = new Date()

  return NextResponse.json({
    birthDate: birthDateParam,
    currentDate: today.toISOString().split('T')[0],
    totalWeeksIn90Years: TOTAL_WEEKS,
    weeksLived: stats.weeksLived,
    weeksRemaining: stats.weeksRemaining,
    percentageLived: Math.round(stats.percentageLived * 100) / 100,
    yearsLived: Math.round(stats.yearsLived * 100) / 100,
    daysLived: stats.daysLived,
    daysRemaining: stats.daysRemaining,
  })
}
