import {
  DAY_COUNTS,
  projectPortfolioAtDate,
  type Investment,
  type PortfolioProjectionEarningPaceReadModel,
} from "@/domain/investments"
import type { ProjectionPointLabel } from "@/app/shared/projection-point-label"

const PROJECTION_DAY_OFFSETS = [
  0,
  DAY_COUNTS.month,
  DAY_COUNTS.month * 3,
  DAY_COUNTS.month * 6,
  DAY_COUNTS.year,
] as const

export interface PortfolioProjectionPoint {
  date: string
  label: ProjectionPointLabel
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

export function getPortfolioProjectionEarningPace(
  investments: Investment[],
  startDate: Date,
): PortfolioProjectionEarningPaceReadModel {
  return projectPortfolioAtDate(investments, startDate, startDate).earningPace
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)

  return nextDate
}

function getProjectionLabel(dayOffset: number): ProjectionPointLabel {
  if (dayOffset === 0) {
    return { kind: "today" }
  }

  if (dayOffset === DAY_COUNTS.year) {
    return { kind: "relative", unit: "year", value: 1 }
  }

  return { kind: "relative", unit: "day", value: dayOffset }
}
