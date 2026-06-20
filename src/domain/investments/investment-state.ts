import { parseCalendarDate, toDateString } from "@/domain/investments/dates"
import {
  getInvestmentBalanceTimeline,
  type InvestmentBalanceSegment,
} from "@/domain/investments/investment-balance-timeline"
import { getTimelineEndDateForInvestment } from "@/domain/investments/lifecycle-periods"
import {
  getInvestmentTermsTimeline,
  type InvestmentTermsSegment,
} from "@/domain/investments/timeline-segments"
import type {
  CalendarDateString,
  Investment,
  InvestmentLifecyclePeriod,
} from "@/domain/investments/types"

export interface InvestmentCalculationContext {
  investment: Investment
  requestedDate: CalendarDateString
  timelineEndDate: CalendarDateString
  termsSegments: InvestmentTermsSegment[]
}

export interface InvestmentBalanceState extends InvestmentCalculationContext {
  balanceTimeline: InvestmentBalanceSegment[]
  currentBalanceSegment: InvestmentBalanceSegment | null
  currentLifecyclePeriod: InvestmentLifecyclePeriod | null
  totalContributedAmount: number
  currentInvestedAmount: number
  estimatedAccruedReturn: number
  estimatedCurrentValue: number
}

export function getInvestmentCalculationContext(
  investment: Investment,
  asOfDate = new Date(),
): InvestmentCalculationContext {
  const requestedDate = toDateString(asOfDate)
  const timelineEndDate = getTimelineEndDateForInvestment(
    investment,
    requestedDate,
  )

  return {
    investment,
    requestedDate,
    timelineEndDate,
    termsSegments: getInvestmentTermsTimeline(
      investment,
      parseCalendarDate(timelineEndDate),
    ),
  }
}

export function getInvestmentBalanceState(
  investment: Investment,
  asOfDate = new Date(),
): InvestmentBalanceState {
  const timelineState = getInvestmentCalculationContext(investment, asOfDate)
  const balanceTimeline = getInvestmentBalanceTimeline(
    investment,
    parseCalendarDate(timelineState.timelineEndDate),
  )
  const currentBalanceSegment = balanceTimeline.at(-1) ?? null
  const currentLifecyclePeriod = currentBalanceSegment?.lifecyclePeriod ?? null
  const totalContributedAmount =
    currentBalanceSegment?.contributionState.totalContributedAmount ?? 0
  const currentInvestedAmount = currentBalanceSegment?.endingBalance ?? 0
  const estimatedAccruedReturn = balanceTimeline.reduce((total, segment) => {
    return total + segment.interestEarned
  }, 0)

  return {
    ...timelineState,
    balanceTimeline,
    currentBalanceSegment,
    currentLifecyclePeriod,
    totalContributedAmount,
    currentInvestedAmount,
    estimatedAccruedReturn,
    estimatedCurrentValue: totalContributedAmount + estimatedAccruedReturn,
  }
}

export function getInvestmentAccruedReturnAtDate(
  investment: Investment,
  asOfDate = new Date(),
): number {
  return getInvestmentBalanceState(investment, asOfDate).estimatedAccruedReturn
}

export function getInvestmentEstimatedCurrentValueAtDate(
  investment: Investment,
  asOfDate = new Date(),
): number {
  return getInvestmentBalanceState(investment, asOfDate).estimatedCurrentValue
}

export function getInvestmentCurrentBalanceSegmentAtDate(
  investment: Investment,
  asOfDate = new Date(),
): InvestmentBalanceSegment | null {
  return getInvestmentBalanceState(investment, asOfDate).currentBalanceSegment
}

export function getInvestmentActiveLifecyclePeriodAtDate(
  investment: Investment,
  asOfDate = new Date(),
): InvestmentLifecyclePeriod | null {
  return getInvestmentBalanceState(investment, asOfDate).currentLifecyclePeriod
}
