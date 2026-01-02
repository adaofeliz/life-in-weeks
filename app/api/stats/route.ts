import { NextRequest, NextResponse } from 'next/server'

const TOTAL_YEARS = 90
const WEEKS_PER_YEAR = 52
const TOTAL_WEEKS = TOTAL_YEARS * WEEKS_PER_YEAR

function calculateWeeksLived(birthDate: Date): number {
  const today = new Date()
  
  // Calculate age in complete years
  let age = today.getFullYear() - birthDate.getFullYear()
  const hadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate())
  
  if (!hadBirthdayThisYear) {
    age--
  }
  
  // Calculate last birthday date
  const lastBirthday = new Date(birthDate)
  lastBirthday.setFullYear(birthDate.getFullYear() + age)
  
  // Calculate weeks since last birthday
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const weeksSinceLastBirthday = Math.floor(
    (today.getTime() - lastBirthday.getTime()) / msPerWeek
  )
  
  // Total weeks = complete years × 52 + weeks into current year
  const weeksLived = age * WEEKS_PER_YEAR + Math.min(weeksSinceLastBirthday, WEEKS_PER_YEAR - 1)
  
  return Math.min(Math.max(0, weeksLived), TOTAL_WEEKS)
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const birthDateParam = searchParams.get('birth_date')

  if (!birthDateParam) {
    return NextResponse.json(
      { error: 'birth_date parameter is required (format: YYYY-MM-DD)' },
      { status: 400 }
    )
  }

  const birthDate = new Date(birthDateParam + 'T00:00:00')

  if (isNaN(birthDate.getTime())) {
    return NextResponse.json(
      { error: 'Invalid date format. Use YYYY-MM-DD' },
      { status: 400 }
    )
  }

  const today = new Date()

  if (birthDate > today) {
    return NextResponse.json(
      { error: 'Birth date must be in the past' },
      { status: 400 }
    )
  }

  const yearsAgo = (today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  if (yearsAgo > 90) {
    return NextResponse.json(
      { error: 'Birth date cannot be more than 90 years ago' },
      { status: 400 }
    )
  }

  const weeksLived = calculateWeeksLived(birthDate)
  const weeksRemaining = TOTAL_WEEKS - weeksLived
  const percentageLived = (weeksLived / TOTAL_WEEKS) * 100

  const msPerDay = 24 * 60 * 60 * 1000
  const daysLived = Math.floor((today.getTime() - birthDate.getTime()) / msPerDay)
  const yearsLived = daysLived / 365.25

  return NextResponse.json({
    birth_date: birthDateParam,
    current_date: today.toISOString().split('T')[0],
    total_weeks_in_90_years: TOTAL_WEEKS,
    weeks_lived: weeksLived,
    weeks_remaining: Math.max(0, weeksRemaining),
    percentage_lived: Math.round(percentageLived * 100) / 100,
    years_lived: Math.round(yearsLived * 100) / 100,
    days_lived: daysLived,
    days_remaining: Math.max(0, TOTAL_YEARS * 365 - daysLived),
  })
}
