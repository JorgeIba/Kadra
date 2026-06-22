import {
  DERIVED_STATUSES,
  INVESTMENT_TYPES,
} from "@/domain/investments/model/constants"
import {
  compareCalendarDatesAscending,
  isCalendarDateWithinRange,
  toDateString,
} from "@/domain/investments/calculations/dates"
import type {
  CalendarDateString,
  DerivedStatus,
  Investment,
  InvestmentLifecycleEvent,
  InvestmentLifecyclePeriod,
} from "@/domain/investments/model/types"

export function deriveLifecyclePeriods(
  investment: Investment,
): InvestmentLifecyclePeriod[] {
  const sortedEvents = getSortedLifecycleEvents(investment)

  return sortedEvents.reduce<InvestmentLifecyclePeriod[]>(
    (periods, event, index) => {
      const nextEvent = sortedEvents[index + 1] ?? null
      const nextEventDate = nextEvent?.effectiveDate ?? null

      if (event.type === INVESTMENT_TYPES.openEnded) {
        // Defensive: if a later same-day event replaces this lifecycle
        // immediately, the derived interval has zero duration, so we skip it.
        if (
          nextEventDate !== null &&
          compareCalendarDatesAscending(event.effectiveDate, nextEventDate) >= 0
        ) {
          return periods
        }

        periods.push({
          id: event.id,
          type: INVESTMENT_TYPES.openEnded,
          paymentFrequency: event.paymentFrequency,
          reinvestmentBehavior: event.reinvestmentBehavior,
          startDate: event.effectiveDate,
          endDate: nextEventDate,
          createdAt: event.createdAt,
        })

        return periods
      }

      const endDate =
        nextEventDate === null ||
        compareCalendarDatesAscending(event.maturityDate, nextEventDate) <= 0
          ? event.maturityDate
          : nextEventDate

      // Defensive: if the fixed-term event is fully collapsed by a same-day
      // replacement or invalid boundary ordering, it produces no usable period.
      if (compareCalendarDatesAscending(event.effectiveDate, endDate) >= 0) {
        return periods
      }

      periods.push({
        id: event.id,
        type: INVESTMENT_TYPES.fixedTerm,
        paymentFrequency: event.paymentFrequency,
        reinvestmentBehavior: event.reinvestmentBehavior,
        startDate: event.effectiveDate,
        endDate,
        maturityDate: event.maturityDate,
        createdAt: event.createdAt,
      })

      return periods
    },
    [],
  )
}

export function getActiveLifecyclePeriodAtDate(
  investment: Investment,
  asOfDate: CalendarDateString,
): InvestmentLifecyclePeriod | null {
  return (
    deriveLifecyclePeriods(investment).find((period) =>
      isCalendarDateWithinRange(asOfDate, period.startDate, period.endDate),
    ) ?? null
  )
}

export function getLatestLifecyclePeriod(
  investment: Investment,
): InvestmentLifecyclePeriod | null {
  return deriveLifecyclePeriods(investment).at(-1) ?? null
}

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

function getSortedLifecycleEvents(
  investment: Investment,
): InvestmentLifecycleEvent[] {
  return [...investment.lifecycleEvents].sort((leftEvent, rightEvent) => {
    const effectiveDateComparison = compareCalendarDatesAscending(
      leftEvent.effectiveDate,
      rightEvent.effectiveDate,
    )

    if (effectiveDateComparison !== 0) {
      return effectiveDateComparison
    }

    const createdAtComparison = leftEvent.createdAt.localeCompare(
      rightEvent.createdAt,
    )

    if (createdAtComparison !== 0) {
      return createdAtComparison
    }

    return leftEvent.id.localeCompare(rightEvent.id)
  })
}
