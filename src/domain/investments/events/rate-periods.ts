import {
  compareCalendarDatesAscending,
  isCalendarDateWithinRange,
} from "@/domain/investments/calculations/dates"
import type {
  CalendarDateString,
  Investment,
  InvestmentRateEvent,
  InvestmentRatePeriod,
} from "@/domain/investments/model/types"

export function deriveRatePeriods(
  investment: Investment,
): InvestmentRatePeriod[] {
  const sortedEvents = getSortedRateEvents(investment)

  return sortedEvents.reduce<InvestmentRatePeriod[]>(
    (periods, event, index) => {
      const nextEvent = sortedEvents[index + 1] ?? null
      const endDate = nextEvent?.effectiveDate ?? null

      // Defensive: if a later same-day event closes this period immediately,
      // the derived interval has zero duration, so we skip it.
      if (
        endDate !== null &&
        compareCalendarDatesAscending(event.effectiveDate, endDate) >= 0
      ) {
        return periods
      }

      periods.push({
        id: event.id,
        annualRate: event.annualRate,
        startDate: event.effectiveDate,
        endDate,
        createdAt: event.createdAt,
      })

      return periods
    },
    [],
  )
}

export function getActiveRatePeriodAtDate(
  investment: Investment,
  asOfDate: CalendarDateString,
): InvestmentRatePeriod | null {
  return (
    deriveRatePeriods(investment).find((period) =>
      isCalendarDateWithinRange(asOfDate, period.startDate, period.endDate),
    ) ?? null
  )
}

function getSortedRateEvents(investment: Investment): InvestmentRateEvent[] {
  return [...investment.rateEvents].sort((leftEvent, rightEvent) => {
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

/**
 * Returns a new investment copy with the specified rate event appended to its history.
 */
export function addRateEvent(
  investment: Investment,
  event: InvestmentRateEvent,
): Investment {
  return {
    ...investment,
    rateEvents: [...investment.rateEvents, event],
  }
}
