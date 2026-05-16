import { INVESTMENT_TYPES } from "@/domain/investments/constants"
import type {
  Currency,
  DerivedStatus,
  InvestmentType,
  PaymentFrequency,
  ReinvestmentBehavior,
} from "@/domain/investments/constants"

export type {
  Currency,
  DerivedStatus,
  InvestmentType,
  PaymentFrequency,
  ReinvestmentBehavior,
}

/**
 * ISO calendar date without time or timezone, formatted as YYYY-MM-DD.
 */
export type CalendarDateString = string

/**
 * Full ISO datetime string for an exact timestamp.
 */
export type IsoDateTimeString = string

/**
 * Shared persisted fields for any investment, regardless of its lifecycle mode.
 */
export interface BaseInvestment {
  id: string
  name: string
  institutionName: string
  originalAmount: number
  annualRate: number
  currency: Currency
  paymentFrequency: PaymentFrequency
  reinvestmentBehavior: ReinvestmentBehavior
  startDate: CalendarDateString
  notes?: string
  createdAt: IsoDateTimeString
  updatedAt: IsoDateTimeString
}

export interface FixedTermInvestment extends BaseInvestment {
  type: typeof INVESTMENT_TYPES.fixedTerm
  endDate: CalendarDateString
}

export interface OpenEndedInvestment extends BaseInvestment {
  type: typeof INVESTMENT_TYPES.openEnded
  endDate?: never
}

/**
 * Main domain entity. An investment is either fixed-term or open-ended.
 */
export type Investment = FixedTermInvestment | OpenEndedInvestment

/**
 * Derived values we can calculate for every investment.
 */
export interface CommonInvestmentDerivedValues {
  derivedStatus: DerivedStatus
  daysActive: number
  estimatedAccruedReturn: number
  estimatedCurrentValue: number
  estimatedPeriodicReturn: number
}

/**
 * Extra derived values that only make sense for fixed-term investments.
 */
export interface FixedTermInvestmentDerivedValues extends CommonInvestmentDerivedValues {
  type: typeof INVESTMENT_TYPES.fixedTerm
  totalTermDays: number
  daysRemaining: number
  progressPercentage: number
  projectedValueAtEndDate: number
  projectedTotalReturnAtEndDate: number
}

export interface OpenEndedInvestmentDerivedValues extends CommonInvestmentDerivedValues {
  type: typeof INVESTMENT_TYPES.openEnded
}

export type InvestmentDerivedValues =
  | FixedTermInvestmentDerivedValues
  | OpenEndedInvestmentDerivedValues

/**
 * Compact view-model shape for cards and lists.
 */
export interface BaseInvestmentSummary {
  id: string
  name: string
  institutionName: string
  originalAmount: number
  annualRate: number
  currency: Currency
  estimatedCurrentValue: number
  derivedStatus: DerivedStatus
}

export interface FixedTermInvestmentSummary extends BaseInvestmentSummary {
  type: typeof INVESTMENT_TYPES.fixedTerm
  progressPercentage: number
}

export interface OpenEndedInvestmentSummary extends BaseInvestmentSummary {
  type: typeof INVESTMENT_TYPES.openEnded
}

export type InvestmentSummary =
  | FixedTermInvestmentSummary
  | OpenEndedInvestmentSummary
