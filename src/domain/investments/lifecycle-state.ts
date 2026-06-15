import {
  DERIVED_STATUSES,
  INVESTMENT_TYPES,
} from "@/domain/investments/constants"
import {
  addCalendarDays,
  parseCalendarDate,
  toDateString,
} from "@/domain/investments/dates"
import { getActiveLifecyclePeriodAtDate } from "@/domain/investments/timeline-segments"
import type {
  CalendarDateString,
  DerivedStatus,
  Investment,
  InvestmentLifecyclePeriod,
} from "@/domain/investments/types"

/**
 * Derives the current lifecycle status at `asOfDate`.
 *
 * `finished` is not stored domain data; with the current MVP rules, any
 * investment without an active lifecycle at `asOfDate` is treated as finished.
 */
export function getDerivedStatus(
  investment: Investment,
  asOfDate = new Date(),
): DerivedStatus {
  const asOfDateString = toDateString(asOfDate)

  if (getActiveLifecyclePeriodAtDate(investment, asOfDateString) !== null) {
    return DERIVED_STATUSES.active
  }

  return DERIVED_STATUSES.finished
}

/**
 * Returns the last date at which the investment was still active for
 * snapshot-style derivations.
 *
 * Usually this is the requested date. For finished fixed-term investments, it
 * snaps back to the last active date so downstream calculations do not keep
 * projecting beyond the investment's active lifecycle.
 */
export function getLastActiveDateForInvestment(
  investment: Investment,
  asOfDate: CalendarDateString,
): CalendarDateString {
  if (getActiveLifecyclePeriodAtDate(investment, asOfDate) !== null) {
    return asOfDate
  }

  const latestLifecyclePeriod = getLatestLifecyclePeriod(investment)

  if (
    latestLifecyclePeriod === null ||
    latestLifecyclePeriod.type !== INVESTMENT_TYPES.fixedTerm
  ) {
    return asOfDate
  }

  // `endDate` is the open end of the lifecycle interval, so the last active
  // day is the calendar day immediately before it.
  return addCalendarDays(parseCalendarDate(latestLifecyclePeriod.endDate), -1)
}

/**
 * Returns the exclusive date boundary to use when building investment
 * timelines.
 *
 * For finished fixed-term investments, this stays on the lifecycle `endDate`
 * so segment math still includes the final active day inside the half-open
 * `[startDate, endDate)` interval.
 */
export function getTimelineEndDateForInvestment(
  investment: Investment,
  asOfDate: CalendarDateString,
): CalendarDateString {
  if (getActiveLifecyclePeriodAtDate(investment, asOfDate) !== null) {
    return asOfDate
  }

  const latestLifecyclePeriod = getLatestLifecyclePeriod(investment)

  if (
    latestLifecyclePeriod === null ||
    latestLifecyclePeriod.type !== INVESTMENT_TYPES.fixedTerm
  ) {
    return asOfDate
  }

  return latestLifecyclePeriod.endDate
}

export function getLatestLifecyclePeriod(
  investment: Investment,
): InvestmentLifecyclePeriod | null {
  const sortedPeriods = [...investment.lifecyclePeriods].sort((left, right) => {
    const startDateComparison = left.startDate.localeCompare(right.startDate)

    if (startDateComparison !== 0) {
      return startDateComparison
    }

    if (left.type === INVESTMENT_TYPES.openEnded) {
      return 1
    }

    if (right.type === INVESTMENT_TYPES.openEnded) {
      return -1
    }

    return left.endDate.localeCompare(right.endDate)
  })

  return sortedPeriods.at(-1) ?? null
}
