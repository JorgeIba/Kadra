import { parseCalendarDate, toDateString } from "@/domain/investments/dates"
import {
  getInvestmentBalanceTimeline,
  type InvestmentBalanceTimelineSegment,
} from "@/domain/investments/investment-balance-timeline"
import {
  getDerivedStatus,
  getLastActiveDateForInvestment,
  getTimelineEndDateForInvestment,
} from "@/domain/investments/lifecycle-state"
import {
  getActiveLifecyclePeriodAtDate,
  getInvestmentTimelineSegments,
  type InvestmentTimelineSegment,
} from "@/domain/investments/timeline-segments"
import type {
  CalendarDateString,
  DerivedStatus,
  Investment,
  InvestmentLifecyclePeriod,
} from "@/domain/investments/types"

export interface InvestmentAnalysis {
  investment: Investment
  asOfDate: Date
  lastActiveDate: CalendarDateString
  structuralTimeline: InvestmentTimelineSegment[]
  balanceTimeline: InvestmentBalanceTimelineSegment[]
  currentBalanceSegment: InvestmentBalanceTimelineSegment | null
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
  const asOfDateString = toDateString(asOfDate)
  const lastActiveDate = getLastActiveDateForInvestment(
    investment,
    asOfDateString,
  )
  const timelineEndDate = getTimelineEndDateForInvestment(
    investment,
    asOfDateString,
  )
  const effectiveDate = parseCalendarDate(timelineEndDate)
  const structuralTimeline = getInvestmentTimelineSegments(
    investment,
    effectiveDate,
  )
  const balanceTimeline = getInvestmentBalanceTimeline(
    investment,
    effectiveDate,
  )
  const currentBalanceSegment = balanceTimeline.at(-1) ?? null
  const currentLifecyclePeriod = getActiveLifecyclePeriodAtDate(
    investment,
    lastActiveDate,
  )
  const totalContributedAmount =
    currentBalanceSegment?.totalContributedAmount ?? 0
  const currentInvestedAmount = currentBalanceSegment?.endingBalance ?? 0
  const estimatedAccruedReturn = balanceTimeline.reduce((total, segment) => {
    return total + segment.interestEarned
  }, 0)

  return {
    investment,
    asOfDate,
    lastActiveDate,
    structuralTimeline,
    balanceTimeline,
    currentBalanceSegment,
    currentLifecyclePeriod,
    derivedStatus: getDerivedStatus(investment, asOfDate),
    originalAmount: getOriginalAmount(investment),
    totalContributedAmount,
    currentInvestedAmount,
    estimatedAccruedReturn,
    estimatedCurrentValue: totalContributedAmount + estimatedAccruedReturn,
    currentAnnualRate: currentBalanceSegment?.annualRate ?? null,
  }
}

function getOriginalAmount(investment: Investment): number {
  const firstContribution = [...investment.contributions].sort((left, right) =>
    left.contributionDate.localeCompare(right.contributionDate),
  )[0]

  if (firstContribution === undefined) {
    throw new Error(`Investment ${investment.id} has no contributions`)
  }

  return firstContribution.amount
}
