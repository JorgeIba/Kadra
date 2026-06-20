import { DAY_COUNTS, getDaysBetween } from "@/domain/investments/dates"
import type {
  CalendarDateString,
  PaymentFrequency,
} from "@/domain/investments/types"
import { getPaymentFrequencyDays } from "@/domain/investments/constants"

export interface InterestPeriod {
  startingAmount: number
  annualRate: number
  startDate: CalendarDateString
  endDate: CalendarDateString
}

export interface CompoundInterestPeriod extends InterestPeriod {
  compoundingFrequencyDays: number
}

export function getSimpleInterest(
  principal: number,
  annualRate: number,
  days: number,
): number {
  return principal * (annualRate / 100) * (days / DAY_COUNTS.year)
}

export function getCompoundInterest(
  principal: number,
  annualRate: number,
  days: number,
  compoundingFrequencyDays: number,
): number {
  if (days <= 0) {
    return 0
  }

  if (compoundingFrequencyDays <= 0) {
    return getSimpleInterest(principal, annualRate, days)
  }

  const fullCompoundingPeriods = Math.floor(days / compoundingFrequencyDays)
  const remainingDays = days % compoundingFrequencyDays

  const periodicRate =
    (annualRate / 100) * (compoundingFrequencyDays / DAY_COUNTS.year)
  const compoundedAmount =
    principal * (1 + periodicRate) ** fullCompoundingPeriods
  // Full payment-frequency cycles compound into the balance. Any leftover
  // days still accrue interest, but they have not reached the next payment
  // boundary yet, so they stay simple over the latest compounded amount.
  const remainingInterest = getSimpleInterest(
    compoundedAmount,
    annualRate,
    remainingDays,
  )

  return compoundedAmount + remainingInterest - principal
}

export function getInterestForPeriod(period: InterestPeriod): number {
  return getSimpleInterest(
    period.startingAmount,
    period.annualRate,
    getDaysBetween(period.startDate, period.endDate),
  )
}

export function getCompoundInterestForPeriod(
  period: CompoundInterestPeriod,
): number {
  return getCompoundInterest(
    period.startingAmount,
    period.annualRate,
    getDaysBetween(period.startDate, period.endDate),
    period.compoundingFrequencyDays,
  )
}

export function getTotalInterest(periods: InterestPeriod[]): number {
  return periods.reduce((totalInterest, period) => {
    return totalInterest + getInterestForPeriod(period)
  }, 0)
}

export function getProjectedTotalInterestAtDate(
  periods: InterestPeriod[],
  targetDate: CalendarDateString,
): number {
  const relevantPeriods = periods.filter(
    (period) => period.startDate < targetDate,
  )

  return getTotalInterest(
    relevantPeriods.map((period) => ({
      ...period,
      endDate: period.endDate < targetDate ? period.endDate : targetDate,
    })),
  )
}

export function getEstimatedInterestForPaymentFrequency(
  startingAmount: number,
  annualRate: number,
  paymentFrequency: PaymentFrequency,
): number {
  return getEstimatedInterestForDays(
    startingAmount,
    annualRate,
    getPaymentFrequencyDays(paymentFrequency),
  )
}

export function getEstimatedMonthlyInterest(
  startingAmount: number,
  annualRate: number,
): number {
  return getEstimatedInterestForDays(
    startingAmount,
    annualRate,
    DAY_COUNTS.month,
  )
}

export function getEstimatedYearlyInterest(
  startingAmount: number,
  annualRate: number,
): number {
  return getEstimatedInterestForDays(
    startingAmount,
    annualRate,
    DAY_COUNTS.year,
  )
}

export function getEstimatedInterestForDays(
  startingAmount: number,
  annualRate: number,
  days: number,
): number {
  return getSimpleInterest(startingAmount, annualRate, days)
}
