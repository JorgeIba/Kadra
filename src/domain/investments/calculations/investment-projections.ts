import {
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
} from "@/domain/investments/model/constants"
import {
  addCalendarDays,
  compareCalendarDatesAscending,
  getDaysBetween,
  parseCalendarDate,
  toDateString,
} from "@/domain/investments/calculations/dates"
import {
  getInvestmentAccruedReturnAtDate,
  getInvestmentActiveLifecyclePeriodAtDate,
} from "@/domain/investments/calculations/investment-state"
import {
  getLatestLifecyclePeriod,
  addLifecycleEvent,
} from "@/domain/investments/events/lifecycle-periods"
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

/**
 * Determines if a fixed-term investment matures after a baseline date.
 * This implements the "No Historical Resurrection" rule: we only apply reinvestment
 * strategies to CDs that are active today or start in the future.
 */
export function isFixedTermMaturingAfterDate(
  investment: Investment,
  baselineDateString: CalendarDateString,
): boolean {
  const latestLifecycle = getLatestLifecyclePeriod(investment)
  if (!latestLifecycle || latestLifecycle.type !== INVESTMENT_TYPES.fixedTerm) {
    return false
  }
  return (
    compareCalendarDatesAscending(latestLifecycle.endDate, baselineDateString) >
    0
  )
}

/**
 * Determines if a fixed-term investment matures during the projection window
 * (between a starting baseline date and a target projection date).
 */
export function isFixedTermMaturingBetweenDates(
  investment: Investment,
  startDateString: CalendarDateString,
  endDateString: CalendarDateString,
): boolean {
  if (!isFixedTermMaturingAfterDate(investment, startDateString)) {
    return false
  }
  const latestLifecycle = getLatestLifecyclePeriod(investment)
  if (!latestLifecycle || latestLifecycle.type !== INVESTMENT_TYPES.fixedTerm) {
    return false
  }
  return (
    compareCalendarDatesAscending(endDateString, latestLifecycle.endDate) >= 0
  )
}

/**
 * Returns a copy of the investment simulating reinvestment of a matured fixed-term
 * investment by appending an open-ended lifecycle event starting on the maturity date.
 *
 * This allows us to reuse the existing compounding engine. If the CD's payment frequency
 * is "at-maturity", it falls back to "daily" compounding because open-ended accounts
 * do not have a maturity date to trigger payouts.
 */
export function withSimulatedReinvestment(
  investment: Investment,
  projectionDate: Date,
  baselineDate: Date,
): Investment {
  const latestLifecycle = getLatestLifecyclePeriod(investment)
  if (!latestLifecycle || latestLifecycle.type !== INVESTMENT_TYPES.fixedTerm) {
    return investment
  }

  const baselineDateString = toDateString(baselineDate)
  if (
    compareCalendarDatesAscending(
      latestLifecycle.endDate,
      baselineDateString,
    ) <= 0
  ) {
    return investment
  }

  const projectionDateString = toDateString(projectionDate)
  const currentMaturityDate = latestLifecycle.endDate

  if (
    compareCalendarDatesAscending(projectionDateString, currentMaturityDate) < 0
  ) {
    return investment
  }

  return addLifecycleEvent(investment, {
    id: `simulated-reinvestment-lifecycle-${investment.id}`,
    type: INVESTMENT_TYPES.openEnded,
    effectiveDate: currentMaturityDate,
    paymentFrequency:
      latestLifecycle.paymentFrequency === PAYMENT_FREQUENCIES.atMaturity
        ? PAYMENT_FREQUENCIES.daily
        : latestLifecycle.paymentFrequency,
    reinvestmentBehavior: latestLifecycle.reinvestmentBehavior,
    createdAt: latestLifecycle.createdAt,
  })
}
