import {
  compareCalendarDatesAscending,
  toDateString,
} from "@/domain/investments/dates"
import { getContributionStateAtDate } from "@/domain/investments/contribution-state"
import {
  deriveLifecyclePeriods,
  getActiveLifecyclePeriodAtDate,
} from "@/domain/investments/lifecycle-periods"
import {
  deriveRatePeriods,
  getActiveRatePeriodAtDate,
} from "@/domain/investments/rate-periods"
import type {
  CalendarDateString,
  Investment,
  InvestmentContributionState,
  InvestmentLifecyclePeriod,
  InvestmentRatePeriod,
} from "@/domain/investments/types"

export interface InvestmentTermsSegment {
  startDate: CalendarDateString
  endDate: CalendarDateString | null
  contributionState: InvestmentContributionState
  ratePeriod: InvestmentRatePeriod
  lifecyclePeriod: InvestmentLifecyclePeriod
}

interface TimelinePeriod {
  startDate: CalendarDateString
  endDate?: CalendarDateString | null
}

/**
 * Builds the ordered terms timeline up to `asOfDate`.
 *
 * Each segment composes the contribution state, active rate period, and active
 * lifecycle period that are stable from `startDate` until `endDate`.
 * `endDate: null` means the current active segment continues indefinitely and
 * should be clipped by callers to their calculation date.
 */
export function getInvestmentTermsTimeline(
  investment: Investment,
  asOfDate: Date,
): InvestmentTermsSegment[] {
  const boundaries = getInvestmentTermsTimelineBoundaries(
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
        contributionState: getContributionStateAtDate(investment, boundary),
        ratePeriod,
        lifecyclePeriod,
      },
    ]
  })
}

export function getInvestmentTermsTimelineBoundaries(
  investment: Investment,
  asOfDate: CalendarDateString,
): CalendarDateString[] {
  const ratePeriods = deriveRatePeriods(investment)
  const lifecyclePeriods = deriveLifecyclePeriods(investment)
  const rawBoundaries = [
    ...getContributionEventBoundaryDates(investment),
    ...getPeriodBoundaryDates(ratePeriods),
    ...getPeriodBoundaryDates(lifecyclePeriods),
    asOfDate,
  ]

  return [...new Set(rawBoundaries)]
    .filter(
      (boundary) => compareCalendarDatesAscending(boundary, asOfDate) <= 0,
    )
    .sort(compareCalendarDatesAscending)
}

function getPeriodBoundaryDates(
  periods: TimelinePeriod[],
): CalendarDateString[] {
  return periods.flatMap((period) => {
    return period.endDate === undefined || period.endDate === null
      ? [period.startDate]
      : [period.startDate, period.endDate]
  })
}

function getContributionEventBoundaryDates(
  investment: Investment,
): CalendarDateString[] {
  return investment.contributionEvents.map(
    (contributionEvent) => contributionEvent.effectiveDate,
  )
}

export { getActiveLifecyclePeriodAtDate, getActiveRatePeriodAtDate }
