import {
  getEstimatedInterestForPaymentFrequency,
  getEstimatedMonthlyInterest,
  getEstimatedYearlyInterest,
} from "@/domain/investments/interest"
import {
  getCurrentBalanceTimelineSegment,
  getInvestmentBalanceTimeline,
} from "@/domain/investments/investment-balance-timeline"
import type { Investment } from "@/domain/investments/types"

export function getEstimatedAccruedReturn(
  investment: Investment,
  asOfDate = new Date(),
): number {
  return getInvestmentBalanceTimeline(investment, asOfDate).reduce(
    (total, segment) => total + segment.interestEarned,
    0,
  )
}

export function getEstimatedPeriodicReturn(
  investment: Investment,
  asOfDate = new Date(),
): number {
  const currentBalanceSegment = getCurrentBalanceTimelineSegment(
    investment,
    asOfDate,
  )

  if (currentBalanceSegment === null) {
    return 0
  }

  return getEstimatedInterestForPaymentFrequency(
    currentBalanceSegment.endingBalance,
    currentBalanceSegment.annualRate,
    currentBalanceSegment.paymentFrequency,
  )
}

export function getEstimatedMonthlyReturn(
  investment: Investment,
  asOfDate = new Date(),
): number {
  const currentBalanceSegment = getCurrentBalanceTimelineSegment(
    investment,
    asOfDate,
  )

  if (currentBalanceSegment === null) {
    return 0
  }

  return getEstimatedMonthlyInterest(
    currentBalanceSegment.endingBalance,
    currentBalanceSegment.annualRate,
  )
}

export function getEstimatedYearlyReturn(
  investment: Investment,
  asOfDate = new Date(),
): number {
  const currentBalanceSegment = getCurrentBalanceTimelineSegment(
    investment,
    asOfDate,
  )

  if (currentBalanceSegment === null) {
    return 0
  }

  return getEstimatedYearlyInterest(
    currentBalanceSegment.endingBalance,
    currentBalanceSegment.annualRate,
  )
}
