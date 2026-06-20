import { DAY_COUNTS } from "@/domain/investments/dates"

// Investment type
export const INVESTMENT_TYPES = {
  fixedTerm: "fixed-term",
  openEnded: "open-ended",
} as const

export type InvestmentType =
  (typeof INVESTMENT_TYPES)[keyof typeof INVESTMENT_TYPES]

export const INVESTMENT_TYPE_LABELS = {
  [INVESTMENT_TYPES.fixedTerm]: "Fixed term",
  [INVESTMENT_TYPES.openEnded]: "Open ended",
} as const satisfies Record<InvestmentType, string>

// Currency
export const CURRENCIES = {
  mxn: "MXN",
} as const

export type Currency = (typeof CURRENCIES)[keyof typeof CURRENCIES]

export const CURRENCY_LABELS = {
  [CURRENCIES.mxn]: "Mexican peso",
} as const satisfies Record<Currency, string>

// Payment frequency
export const PAYMENT_FREQUENCIES = {
  daily: "daily",
  weekly: "weekly",
  monthly: "monthly",
  atMaturity: "at-maturity",
} as const

export type PaymentFrequency =
  (typeof PAYMENT_FREQUENCIES)[keyof typeof PAYMENT_FREQUENCIES]

export const PAYMENT_FREQUENCY_LABELS = {
  [PAYMENT_FREQUENCIES.daily]: "Daily",
  [PAYMENT_FREQUENCIES.weekly]: "Weekly",
  [PAYMENT_FREQUENCIES.monthly]: "Monthly",
  [PAYMENT_FREQUENCIES.atMaturity]: "At maturity",
} as const satisfies Record<PaymentFrequency, string>

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

export const REINVESTMENT_BEHAVIOR_LABELS = {
  [REINVESTMENT_BEHAVIORS.automatic]: "Automatic",
  [REINVESTMENT_BEHAVIORS.toCash]: "To cash",
} as const satisfies Record<ReinvestmentBehavior, string>

// Derived status
export const DERIVED_STATUSES = {
  active: "active",
  finished: "finished",
} as const

export type DerivedStatus =
  (typeof DERIVED_STATUSES)[keyof typeof DERIVED_STATUSES]

export const DERIVED_STATUS_LABELS = {
  [DERIVED_STATUSES.active]: "Active",
  [DERIVED_STATUSES.finished]: "Finished",
} as const satisfies Record<DerivedStatus, string>

export function getPaymentFrequencyDays(
  paymentFrequency: PaymentFrequency,
): number {
  return PAYMENT_FREQUENCY_DAYS[paymentFrequency]
}
