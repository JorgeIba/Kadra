import {
  DAY_COUNTS,
  projectPortfolioAtDate,
  type Investment,
} from "@/domain/investments"

const PROJECTION_DAY_OFFSETS = [
  0,
  DAY_COUNTS.month,
  DAY_COUNTS.month * 3,
  DAY_COUNTS.month * 6,
  DAY_COUNTS.year,
] as const

export interface PortfolioProjectionPoint {
  date: string
  label: string
  estimatedValue: number
  projectedEarnings: number
}

export function getPortfolioProjectionPoints(
  investments: Investment[],
  startDate: Date,
): PortfolioProjectionPoint[] {
  return PROJECTION_DAY_OFFSETS.map((dayOffset) => {
    const projectionDate = addDays(startDate, dayOffset)
    const projection = projectPortfolioAtDate(
      investments,
      projectionDate,
      startDate,
    )

    return {
      date: projection.projectionDate,
      label: getProjectionLabel(dayOffset),
      estimatedValue: projection.estimatedValue,
      projectedEarnings: projection.projectedEarnings,
    }
  })
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)

  return nextDate
}

function getProjectionLabel(dayOffset: number) {
  if (dayOffset === 0) {
    return "Today"
  }

  if (dayOffset === DAY_COUNTS.year) {
    return "1 year"
  }

  return `${dayOffset} days`
}
