import { PAYMENT_FREQUENCY_DAYS } from "@/domain/investments/constants"
import { getDaysActive } from "@/domain/investments/dates"
import type { Investment, PaymentFrequency } from "@/domain/investments/types"

const YEAR_DAYS = 365

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
