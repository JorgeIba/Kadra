import {
  compareCalendarDatesAscending,
  isCalendarDateWithinRange,
  toDateString,
} from "@/domain/investments/dates"
import type {
  CalendarDateString,
  Investment,
  InvestmentLifecyclePeriod,
  InvestmentRatePeriod,
  InvestmentType,
  PaymentFrequency,
  ReinvestmentBehavior,
} from "@/domain/investments/types"

export interface InvestmentTimelineSegment {
  startDate: CalendarDateString
  endDate: CalendarDateString | null
  totalContributedAmount: number
  annualRate: number
  lifecycleType: InvestmentType
  paymentFrequency: PaymentFrequency
  reinvestmentBehavior: ReinvestmentBehavior
}

interface TimelinePeriod {
  startDate: CalendarDateString
  endDate?: CalendarDateString
}

/**
 * Builds structural timeline segments up to `asOfDate`.
 *
 * Each segment represents a period where contributed capital, active rate, and
 * lifecycle settings stay constant. `endDate: null` means the current active
 * segment continues indefinitely and should be clipped by callers to their
 * calculation date. `totalContributedAmount` is raw contributed capital at the
 * segment start, not a compounded balance.
 */
export function getInvestmentTimelineSegments(
  investment: Investment,
  asOfDate: Date,
): InvestmentTimelineSegment[] {
  const boundaries = getInvestmentTimelineBoundaries(
    investment,
    toDateString(asOfDate),
  )

  return boundaries.flatMap((boundary, index) => {
    const lifecyclePeriod = getActiveLifecyclePeriodAtDate(investment, boundary)

    if (lifecyclePeriod === null) {
      return []
    }

    const ratePeriod = getActiveRatePeriodAtDate(investment, boundary)

    if (ratePeriod === null) {
      return []
    }

    const nextBoundary = boundaries[index + 1] ?? null

    return [
      {
        startDate: boundary,
        endDate: nextBoundary,
        totalContributedAmount: getTotalContributedAmountAtDate(
          investment,
          boundary,
        ),
        annualRate: ratePeriod.annualRate,
        lifecycleType: lifecyclePeriod.type,
        paymentFrequency: lifecyclePeriod.paymentFrequency,
        reinvestmentBehavior: lifecyclePeriod.reinvestmentBehavior,
      },
    ]
  })
}

export function getInvestmentTimelineBoundaries(
  investment: Investment,
  asOfDate: CalendarDateString,
): CalendarDateString[] {
  const rawBoundaries = [
    ...getContributionBoundaryDates(investment),
    ...getPeriodBoundaryDates(investment.ratePeriods),
    ...getPeriodBoundaryDates(investment.lifecyclePeriods),
    asOfDate,
  ]

  return [...new Set(rawBoundaries)]
    .filter(
      (boundary) => compareCalendarDatesAscending(boundary, asOfDate) <= 0,
    )
    .sort(compareCalendarDatesAscending)
}

function getContributionBoundaryDates(
  investment: Investment,
): CalendarDateString[] {
  return investment.contributions.map(
    (contribution) => contribution.contributionDate,
  )
}

function getPeriodBoundaryDates(
  periods: TimelinePeriod[],
): CalendarDateString[] {
  return periods.flatMap((period) => {
    return period.endDate === undefined
      ? [period.startDate]
      : [period.startDate, period.endDate]
  })
}

export function getTotalContributedAmountAtDate(
  investment: Investment,
  asOfDate: CalendarDateString,
): number {
  return investment.contributions.reduce((total, contribution) => {
    if (
      compareCalendarDatesAscending(contribution.contributionDate, asOfDate) > 0
    ) {
      return total
    }

    return total + contribution.amount
  }, 0)
}

/**
 * Returns the rate period that is active at `asOfDate`.
 *
 * `null` means there is no rate period covering that date.
 */
export function getActiveRatePeriodAtDate(
  investment: Investment,
  asOfDate: CalendarDateString,
): InvestmentRatePeriod | null {
  return getActivePeriodAtDate(investment.ratePeriods, asOfDate)
}

/**
 * Returns the lifecycle period that is active at `asOfDate`.
 *
 * `null` means there is no lifecycle period covering that date.
 */
export function getActiveLifecyclePeriodAtDate(
  investment: Investment,
  asOfDate: CalendarDateString,
): InvestmentLifecyclePeriod | null {
  return getActivePeriodAtDate(investment.lifecyclePeriods, asOfDate)
}

function getActivePeriodAtDate<TPeriod extends TimelinePeriod>(
  periods: TPeriod[],
  asOfDate: CalendarDateString,
): TPeriod | null {
  const sortedPeriods = [...periods].sort((leftPeriod, rightPeriod) =>
    compareCalendarDatesAscending(leftPeriod.startDate, rightPeriod.startDate),
  )

  return (
    sortedPeriods.find((period) => isDateWithinPeriod(asOfDate, period)) ?? null
  )
}

function isDateWithinPeriod(
  asOfDate: CalendarDateString,
  period: TimelinePeriod,
): boolean {
  return isCalendarDateWithinRange(asOfDate, period.startDate, period.endDate)
}
