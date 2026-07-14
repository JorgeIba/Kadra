import { compareCalendarDatesAscending } from "@/domain/investments/calculations/dates"
import type {
  CalendarDateString,
  Investment,
  InvestmentContributionEvent,
  InvestmentContributionState,
} from "@/domain/investments/model/types"

export function getContributionStateAtDate(
  investment: Investment,
  asOfDate: CalendarDateString,
): InvestmentContributionState {
  return {
    totalContributedAmount: investment.contributionEvents.reduce(
      (total, contributionEvent) => {
        if (
          compareCalendarDatesAscending(
            contributionEvent.effectiveDate,
            asOfDate,
          ) > 0
        ) {
          return total
        }

        const multiplier = contributionEvent.kind === "withdrawal" ? -1 : 1
        return total + contributionEvent.amount * multiplier
      },
      0,
    ),
  }
}

/**
 * Returns a new investment copy with the specified contribution event appended to its history.
 */
export function addContributionEvent(
  investment: Investment,
  event: InvestmentContributionEvent,
): Investment {
  return {
    ...investment,
    contributionEvents: [...investment.contributionEvents, event],
  }
}
