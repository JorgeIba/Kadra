import {
  getCompoundInterestForPeriod,
  getInterestForPeriod,
} from "@/domain/investments/calculations/interest"
import { toDateString } from "@/domain/investments/calculations/dates"
import {
  getInvestmentTermsTimeline,
  type InvestmentTermsSegment,
} from "@/domain/investments/events/timeline-segments"
import { REINVESTMENT_BEHAVIORS } from "@/domain/investments/model/constants"
import type { Investment } from "@/domain/investments/model/types"
import { getPaymentFrequencyDays } from "@/domain/investments/model/constants"

export interface InvestmentBalanceSegment extends InvestmentTermsSegment {
  startingBalance: number
  interestEarned: number
  endingBalance: number
}

/**
 * Builds balance-aware segments from the investment terms timeline.
 *
 * `startingBalance` is the amount invested at the segment start after adding
 * any previously reinvested earnings. `interestEarned` is the interest accrued
 * during that segment. `endingBalance` only includes that earned interest when
 * the segment reinvests automatically.
 */
export function getInvestmentBalanceTimeline(
  investment: Investment,
  asOfDate: Date,
): InvestmentBalanceSegment[] {
  let carriedReinvestedEarnings = 0
  const asOfDateString = toDateString(asOfDate)

  return getInvestmentTermsTimeline(investment, asOfDate).map((segment) => {
    const startingBalance =
      segment.contributionState.totalContributedAmount +
      carriedReinvestedEarnings
    const calculationEndDate = segment.endDate ?? asOfDateString
    const interestPeriod = {
      startingAmount: startingBalance,
      annualRate: segment.ratePeriod.annualRate,
      startDate: segment.startDate,
      endDate: calculationEndDate,
    }
    const interestEarned =
      segment.lifecyclePeriod.reinvestmentBehavior ===
      REINVESTMENT_BEHAVIORS.automatic
        ? getCompoundInterestForPeriod({
            ...interestPeriod,
            compoundingFrequencyDays: getPaymentFrequencyDays(
              segment.lifecyclePeriod.paymentFrequency,
            ),
          })
        : getInterestForPeriod(interestPeriod)
    const endingBalance =
      segment.lifecyclePeriod.reinvestmentBehavior ===
      REINVESTMENT_BEHAVIORS.automatic
        ? startingBalance + interestEarned
        : startingBalance

    if (
      segment.lifecyclePeriod.reinvestmentBehavior ===
      REINVESTMENT_BEHAVIORS.automatic
    ) {
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
): InvestmentBalanceSegment | null {
  return getInvestmentBalanceTimeline(investment, asOfDate).at(-1) ?? null
}
