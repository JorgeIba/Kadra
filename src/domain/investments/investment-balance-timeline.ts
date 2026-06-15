import { getInterestForPeriod } from "@/domain/investments/interest"
import { toDateString } from "@/domain/investments/dates"
import {
  getInvestmentTimelineSegments,
  type InvestmentTimelineSegment,
} from "@/domain/investments/timeline-segments"
import type { Investment } from "@/domain/investments/types"

export interface InvestmentBalanceTimelineSegment extends InvestmentTimelineSegment {
  startingBalance: number
  interestEarned: number
  endingBalance: number
}

/**
 * Builds balance-aware segments from the structural investment timeline.
 *
 * `startingBalance` is the amount invested at the segment start after adding
 * any previously reinvested earnings. `interestEarned` is the interest accrued
 * during that segment. `endingBalance` only includes that earned interest when
 * the segment reinvests automatically.
 */
export function getInvestmentBalanceTimeline(
  investment: Investment,
  asOfDate: Date,
): InvestmentBalanceTimelineSegment[] {
  let carriedReinvestedEarnings = 0
  const asOfDateString = toDateString(asOfDate)

  return getInvestmentTimelineSegments(investment, asOfDate).map((segment) => {
    const startingBalance =
      segment.totalContributedAmount + carriedReinvestedEarnings
    const calculationEndDate = segment.endDate ?? asOfDateString
    const interestEarned = getInterestForPeriod({
      startingAmount: startingBalance,
      annualRate: segment.annualRate,
      startDate: segment.startDate,
      endDate: calculationEndDate,
    })
    // Current MVP limitation: this treats automatic reinvestment as one
    // end-of-segment accrual. A later pass should compound within the segment
    // at each payment-frequency boundary.
    const endingBalance =
      segment.reinvestmentBehavior === "automatic"
        ? startingBalance + interestEarned
        : startingBalance

    if (segment.reinvestmentBehavior === "automatic") {
      carriedReinvestedEarnings += interestEarned
    }

    return {
      ...segment,
      startingBalance,
      interestEarned,
      endingBalance,
    }
  })
}

export function getCurrentBalanceTimelineSegment(
  investment: Investment,
  asOfDate: Date,
): InvestmentBalanceTimelineSegment | null {
  return getInvestmentBalanceTimeline(investment, asOfDate).at(-1) ?? null
}
