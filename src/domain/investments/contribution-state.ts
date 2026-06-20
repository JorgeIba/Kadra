import { compareCalendarDatesAscending } from "@/domain/investments/dates"
import type {
  CalendarDateString,
  Investment,
  InvestmentContributionState,
} from "@/domain/investments/types"

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

        return total + contributionEvent.amount
      },
      0,
    ),
  }
}
