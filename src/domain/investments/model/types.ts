import { INVESTMENT_TYPES } from "@/domain/investments/model/constants"
import type {
  Currency,
  DerivedStatus,
  InvestmentType,
  PaymentFrequency,
  ReinvestmentBehavior,
  ReinvestmentStrategy,
} from "@/domain/investments/model/constants"

export type {
  Currency,
  DerivedStatus,
  InvestmentType,
  PaymentFrequency,
  ReinvestmentBehavior,
  ReinvestmentStrategy,
}

/**
 * ISO calendar date without time or timezone, formatted as YYYY-MM-DD.
 */
export type CalendarDateString = string

/**
 * Full ISO datetime string for an exact timestamp.
 */
export type IsoDateTimeString = string

export type ContributionEventKind = "contribution" | "withdrawal"

export interface InvestmentContributionEvent {
  id: string
  amount: number
  effectiveDate: CalendarDateString
  notes?: string
  createdAt: IsoDateTimeString
  kind?: ContributionEventKind
}

export interface InvestmentRateEvent {
  id: string
  annualRate: number
  effectiveDate: CalendarDateString
  createdAt: IsoDateTimeString
}

interface BaseInvestmentLifecycleEvent {
  id: string
  paymentFrequency: PaymentFrequency
  reinvestmentBehavior: ReinvestmentBehavior
  effectiveDate: CalendarDateString
  createdAt: IsoDateTimeString
}

export interface FixedTermInvestmentLifecycleEvent extends BaseInvestmentLifecycleEvent {
  type: typeof INVESTMENT_TYPES.fixedTerm
  maturityDate: CalendarDateString
}

export interface OpenEndedInvestmentLifecycleEvent extends BaseInvestmentLifecycleEvent {
  type: typeof INVESTMENT_TYPES.openEnded
  maturityDate?: never
}

export type InvestmentLifecycleEvent =
  | FixedTermInvestmentLifecycleEvent
  | OpenEndedInvestmentLifecycleEvent

export interface InvestmentContributionState {
  totalContributedAmount: number
}

export interface InvestmentRatePeriod {
  id: string
  annualRate: number
  startDate: CalendarDateString
  endDate: CalendarDateString | null
  createdAt: IsoDateTimeString
}

interface BaseInvestmentLifecyclePeriod {
  id: string
  paymentFrequency: PaymentFrequency
  reinvestmentBehavior: ReinvestmentBehavior
  startDate: CalendarDateString
  endDate: CalendarDateString | null
  createdAt: IsoDateTimeString
}

export interface FixedTermInvestmentLifecyclePeriod extends BaseInvestmentLifecyclePeriod {
  type: typeof INVESTMENT_TYPES.fixedTerm
  endDate: CalendarDateString
  maturityDate: CalendarDateString
}

export interface OpenEndedInvestmentLifecyclePeriod extends BaseInvestmentLifecyclePeriod {
  type: typeof INVESTMENT_TYPES.openEnded
  maturityDate?: never
}

export type InvestmentLifecyclePeriod =
  | FixedTermInvestmentLifecyclePeriod
  | OpenEndedInvestmentLifecyclePeriod

/**
 * Main domain entity. An investment owns the dated histories that describe how
 * the asset has changed over time.
 */
export interface InvestmentProfile {
  id: string
  name: string
  institutionName: string
  currency: Currency
  notes?: string
}

export interface Investment extends InvestmentProfile {
  createdAt: IsoDateTimeString
  updatedAt: IsoDateTimeString
  contributionEvents: InvestmentContributionEvent[]
  rateEvents: InvestmentRateEvent[]
  lifecycleEvents: InvestmentLifecycleEvent[]
}

/**
 * Current read model for one investment at a selected date.
 */
export interface BaseResolvedInvestment extends InvestmentProfile {
  createdAt: IsoDateTimeString
  updatedAt: IsoDateTimeString
  originalAmount: number
  currentInvestedAmount: number
  annualRate: number
  paymentFrequency: PaymentFrequency
  reinvestmentBehavior: ReinvestmentBehavior
  startDate: CalendarDateString
  derivedStatus: DerivedStatus
  currentLifecycleDaysActive: number
  estimatedAccruedReturn: number
  estimatedCurrentValue: number
  estimatedPeriodicReturn: number
}

export interface FixedTermResolvedInvestment extends BaseResolvedInvestment {
  type: typeof INVESTMENT_TYPES.fixedTerm
  endDate: CalendarDateString
  totalTermDays: number
  daysRemaining: number
  progressPercentage: number
  projectedValueAtEndDate: number
  projectedTotalReturnAtEndDate: number
}

export interface OpenEndedResolvedInvestment extends BaseResolvedInvestment {
  type: typeof INVESTMENT_TYPES.openEnded
  endDate?: never
}

export type ResolvedInvestment =
  | FixedTermResolvedInvestment
  | OpenEndedResolvedInvestment

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
