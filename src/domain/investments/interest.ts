import { PAYMENT_FREQUENCY_DAYS } from "@/domain/investments/constants"
import { getDaysBetween } from "@/domain/investments/dates"
import type {
  CalendarDateString,
  PaymentFrequency,
} from "@/domain/investments/types"

const YEAR_DAYS = 365
const MONTH_DAYS = 30

export interface InterestPeriod {
  startingAmount: number
  annualRate: number
  startDate: CalendarDateString
  endDate: CalendarDateString
}

export function getSimpleInterest(
  principal: number,
  annualRate: number,
  days: number,
): number {
  return principal * (annualRate / 100) * (days / YEAR_DAYS)
}

export function getInterestForPeriod(period: InterestPeriod): number {
  return getSimpleInterest(
    period.startingAmount,
    period.annualRate,
    getDaysBetween(period.startDate, period.endDate),
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
  return getEstimatedInterestForDays(startingAmount, annualRate, MONTH_DAYS)
}

export function getEstimatedYearlyInterest(
  startingAmount: number,
  annualRate: number,
): number {
  return getEstimatedInterestForDays(startingAmount, annualRate, YEAR_DAYS)
}

export function getEstimatedInterestForDays(
  startingAmount: number,
  annualRate: number,
  days: number,
): number {
  return getSimpleInterest(startingAmount, annualRate, days)
}

export function getPaymentFrequencyDays(
  paymentFrequency: PaymentFrequency,
): number {
  return PAYMENT_FREQUENCY_DAYS[paymentFrequency]
}
