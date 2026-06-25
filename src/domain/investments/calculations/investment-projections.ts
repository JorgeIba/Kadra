import { INVESTMENT_TYPES } from "@/domain/investments/model/constants"
import {
  addCalendarDays,
  getDaysBetween,
  parseCalendarDate,
  toDateString,
} from "@/domain/investments/calculations/dates"
import {
  getInvestmentAccruedReturnAtDate,
  getInvestmentActiveLifecyclePeriodAtDate,
} from "@/domain/investments/calculations/investment-state"
import type {
  CalendarDateString,
  Investment,
  InvestmentLifecyclePeriod,
} from "@/domain/investments/model/types"

export function getInvestmentProjectedEarningsBetweenDates(
  investment: Investment,
  startDate: Date,
  endDate: Date,
): number {
  return (
    getInvestmentAccruedReturnAtDate(investment, endDate) -
    getInvestmentAccruedReturnAtDate(investment, startDate)
  )
}

export function getUpcomingInvestmentProjectedEarningsForDays(
  investment: Investment,
  days: number,
  asOfDate = new Date(),
): number {
  const currentLifecyclePeriod = getInvestmentActiveLifecyclePeriodAtDate(
    investment,
    asOfDate,
  )

  if (currentLifecyclePeriod === null) {
    return 0
  }

  return getInvestmentProjectedEarningsBetweenDates(
    investment,
    asOfDate,
    getUpcomingInvestmentProjectionTargetDate(
      currentLifecyclePeriod,
      days,
      asOfDate,
    ),
  )
}

export function getPeriodInvestmentProjectedEarningsForDays(
  investment: Investment,
  days: number,
  asOfDate = new Date(),
): number {
  const currentLifecyclePeriod = getInvestmentActiveLifecyclePeriodAtDate(
    investment,
    asOfDate,
  )

  if (currentLifecyclePeriod === null) {
    return 0
  }

  return getInvestmentProjectedEarningsBetweenDates(
    investment,
    parseCalendarDate(currentLifecyclePeriod.startDate),
    getPeriodInvestmentProjectionTargetDate(currentLifecyclePeriod, days),
  )
}

export function getUpcomingInvestmentProjectedEarningsUntilDate(
  investment: Investment,
  targetDate: CalendarDateString,
  asOfDate = new Date(),
): number {
  return getUpcomingInvestmentProjectedEarningsForDays(
    investment,
    getDaysBetween(toDateString(asOfDate), targetDate),
    asOfDate,
  )
}

export function getUpcomingInvestmentProjectionTargetDate(
  lifecyclePeriod: InvestmentLifecyclePeriod,
  requestedDays: number,
  asOfDate: Date,
): Date {
  if (requestedDays <= 0) {
    return asOfDate
  }

  if (lifecyclePeriod.type === INVESTMENT_TYPES.openEnded) {
    return parseCalendarDate(addCalendarDays(asOfDate, requestedDays))
  }

  const daysUntilMaturity = getDaysBetween(
    toDateString(asOfDate),
    lifecyclePeriod.endDate,
  )
  const earningDays = Math.max(0, Math.min(requestedDays, daysUntilMaturity))

  return parseCalendarDate(addCalendarDays(asOfDate, earningDays))
}

export function getPeriodInvestmentProjectionTargetDate(
  lifecyclePeriod: InvestmentLifecyclePeriod,
  requestedDays: number,
): Date {
  const startDate = parseCalendarDate(lifecyclePeriod.startDate)

  if (requestedDays <= 0) {
    return startDate
  }

  if (lifecyclePeriod.type === INVESTMENT_TYPES.openEnded) {
    return parseCalendarDate(addCalendarDays(startDate, requestedDays))
  }

  return parseCalendarDate(
    addCalendarDays(
      startDate,
      Math.min(
        requestedDays,
        getDaysBetween(lifecyclePeriod.startDate, lifecyclePeriod.endDate),
      ),
    ),
  )
}
