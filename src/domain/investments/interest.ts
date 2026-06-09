import { PAYMENT_FREQUENCY_DAYS } from "@/domain/investments/constants"
import { getDaysActive } from "@/domain/investments/dates"
import type { Investment, PaymentFrequency } from "@/domain/investments/types"

const YEAR_DAYS = 365
const MONTH_DAYS = 30

export function getEstimatedAccruedReturn(
  investment: Investment,
  asOfDate = new Date(),
): number {
  const daysActive = getDaysActive(investment, asOfDate)

  return getSimpleInterest(
    investment.originalAmount,
    investment.annualRate,
    daysActive,
  )
}

export function getEstimatedPeriodicReturn(investment: Investment): number {
  return getSimpleInterest(
    investment.originalAmount,
    investment.annualRate,
    getPaymentFrequencyDays(investment.paymentFrequency),
  )
}

export function getEstimatedMonthlyReturn(investment: Investment): number {
  return getSimpleInterest(
    investment.originalAmount,
    investment.annualRate,
    MONTH_DAYS,
  )
}

export function getEstimatedYearlyReturn(investment: Investment): number {
  return getSimpleInterest(
    investment.originalAmount,
    investment.annualRate,
    YEAR_DAYS,
  )
}

export function getSimpleInterest(
  principal: number,
  annualRate: number,
  days: number,
): number {
  return principal * (annualRate / 100) * (days / YEAR_DAYS)
}

export function getPaymentFrequencyDays(
  paymentFrequency: PaymentFrequency,
): number {
  return PAYMENT_FREQUENCY_DAYS[paymentFrequency]
}
