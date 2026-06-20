import type { InvestmentBalanceSegment } from "@/domain/investments/investment-balance-timeline"
import { getDerivedStatus } from "@/domain/investments/lifecycle-periods"
import { getInvestmentBalanceState } from "@/domain/investments/investment-state"
import type { InvestmentTermsSegment } from "@/domain/investments/timeline-segments"
import type {
  DerivedStatus,
  Investment,
  InvestmentLifecyclePeriod,
} from "@/domain/investments/types"

export interface InvestmentAnalysis {
  investment: Investment
  asOfDate: Date
  termsSegments: InvestmentTermsSegment[]
  balanceTimeline: InvestmentBalanceSegment[]
  currentBalanceSegment: InvestmentBalanceSegment | null
  currentLifecyclePeriod: InvestmentLifecyclePeriod | null
  derivedStatus: DerivedStatus
  originalAmount: number
  totalContributedAmount: number
  currentInvestedAmount: number
  estimatedAccruedReturn: number
  estimatedCurrentValue: number
  currentAnnualRate: number | null
}

/**
 * Builds the reusable "as-of" view for one investment.
 *
 * Feature code should prefer this analysis object over stitching together
 * lifecycle, timeline, and return helpers independently.
 */
export function analyzeInvestment(
  investment: Investment,
  asOfDate = new Date(),
): InvestmentAnalysis {
  const balanceState = getInvestmentBalanceState(investment, asOfDate)

  return {
    investment,
    asOfDate,
    termsSegments: balanceState.termsSegments,
    balanceTimeline: balanceState.balanceTimeline,
    currentBalanceSegment: balanceState.currentBalanceSegment,
    currentLifecyclePeriod: balanceState.currentLifecyclePeriod,
    derivedStatus: getDerivedStatus(investment, asOfDate),
    originalAmount: getOriginalAmount(investment),
    totalContributedAmount: balanceState.totalContributedAmount,
    currentInvestedAmount: balanceState.currentInvestedAmount,
    estimatedAccruedReturn: balanceState.estimatedAccruedReturn,
    estimatedCurrentValue: balanceState.estimatedCurrentValue,
    currentAnnualRate:
      balanceState.currentBalanceSegment?.ratePeriod.annualRate ?? null,
  }
}

function getOriginalAmount(investment: Investment): number {
  const firstContribution = [...investment.contributionEvents].sort(
    (left, right) => left.effectiveDate.localeCompare(right.effectiveDate),
  )[0]

  if (firstContribution === undefined) {
    throw new Error(`Investment ${investment.id} has no contributions`)
  }

  return firstContribution.amount
}
