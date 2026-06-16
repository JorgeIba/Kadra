import {
  getPortfolioEstimatedCurrentValue,
  resolveInvestment,
  toDateString,
  type Investment,
} from "@/domain/investments"

const PROJECTION_DAY_OFFSETS = [0, 30, 90, 180, 365] as const

export interface PortfolioProjectionPoint {
  date: string
  label: string
  estimatedValue: number
}

export function getPortfolioProjectionPoints(
  investments: Investment[],
  startDate: Date,
): PortfolioProjectionPoint[] {
  return PROJECTION_DAY_OFFSETS.map((dayOffset) => {
    const projectionDate = addDays(startDate, dayOffset)
    const resolvedInvestments = investments.map((investment) =>
      resolveInvestment(investment, projectionDate),
    )

    return {
      date: toDateString(projectionDate),
      label: getProjectionLabel(dayOffset),
      estimatedValue: getPortfolioEstimatedCurrentValue(resolvedInvestments),
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

  if (dayOffset === 365) {
    return "1 year"
  }

  return `${dayOffset} days`
}
