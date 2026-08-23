import { DAY_COUNTS } from "@/domain/investments/calculations/dates"

// Investment type
export const INVESTMENT_TYPES = {
  fixedTerm: "fixed-term",
  openEnded: "open-ended",
} as const

export type InvestmentType =
  (typeof INVESTMENT_TYPES)[keyof typeof INVESTMENT_TYPES]

// Currency
export const CURRENCIES = {
  mxn: "MXN",
} as const

export type Currency = (typeof CURRENCIES)[keyof typeof CURRENCIES]

// Payment frequency
export const PAYMENT_FREQUENCIES = {
  daily: "daily",
  weekly: "weekly",
  monthly: "monthly",
  atMaturity: "at-maturity",
} as const

export type PaymentFrequency =
  (typeof PAYMENT_FREQUENCIES)[keyof typeof PAYMENT_FREQUENCIES]

export const PAYMENT_FREQUENCY_DAYS = {
  [PAYMENT_FREQUENCIES.daily]: DAY_COUNTS.day,
  [PAYMENT_FREQUENCIES.weekly]: DAY_COUNTS.week,
  [PAYMENT_FREQUENCIES.monthly]: DAY_COUNTS.month,
  [PAYMENT_FREQUENCIES.atMaturity]: 0,
} as const satisfies Record<PaymentFrequency, number>

// Reinvestment behavior
export const REINVESTMENT_BEHAVIORS = {
  automatic: "automatic",
  toCash: "to-cash",
} as const

export type ReinvestmentBehavior =
  (typeof REINVESTMENT_BEHAVIORS)[keyof typeof REINVESTMENT_BEHAVIORS]

// Reinvestment strategy for projections
export const REINVESTMENT_STRATEGIES = {
  keepAsCash: "keep-as-cash",
  reinvest: "reinvest",
  strict: "strict",
} as const

export type ReinvestmentStrategy =
  (typeof REINVESTMENT_STRATEGIES)[keyof typeof REINVESTMENT_STRATEGIES]

export const REINVESTMENT_STRATEGY_OPTIONS = [
  REINVESTMENT_STRATEGIES.keepAsCash,
  REINVESTMENT_STRATEGIES.reinvest,
  REINVESTMENT_STRATEGIES.strict,
] as const satisfies ReadonlyArray<ReinvestmentStrategy>

// Derived status
export const DERIVED_STATUSES = {
  active: "active",
  finished: "finished",
} as const

export type DerivedStatus =
  (typeof DERIVED_STATUSES)[keyof typeof DERIVED_STATUSES]

export function getPaymentFrequencyDays(
  paymentFrequency: PaymentFrequency,
): number {
  return PAYMENT_FREQUENCY_DAYS[paymentFrequency]
}
