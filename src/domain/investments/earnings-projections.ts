import {
  DERIVED_STATUSES,
  INVESTMENT_TYPES,
} from "@/domain/investments/constants"
import { getInvestmentDerivedValues } from "@/domain/investments/derived-investment"
import { getDerivedStatus } from "@/domain/investments/derived-values"
import {
  addCalendarDays,
  getDaysBetween,
  toDateString,
} from "@/domain/investments/dates"
import { getSimpleInterest } from "@/domain/investments/interest"
import type {
  CalendarDateString,
  DerivedInvestment,
  Investment,
} from "@/domain/investments/types"

export const EARNINGS_PERIODS = {
  daily: "daily",
  weekly: "weekly",
  monthly: "monthly",
  yearly: "yearly",
} as const

export type EarningsPeriod =
  (typeof EARNINGS_PERIODS)[keyof typeof EARNINGS_PERIODS]

export interface EarningsSummary {
  daily: number
  weekly: number
  monthly: number
  yearly: number
}

export interface InvestmentEarningsBreakdownItem {
  investmentId: string
  name: string
  institutionName: string
  estimatedEarnings: number
  percentage: number
}

export type InvestmentEarningsBreakdown = InvestmentEarningsBreakdownItem[]

export interface PortfolioEarningsView {
  totals: EarningsSummary
  breakdownPeriod: EarningsPeriod
  breakdown: InvestmentEarningsBreakdown
}

export interface PortfolioEarningsSnapshot {
  upcoming: PortfolioEarningsView
  period: PortfolioEarningsView
}

const EARNINGS_PERIOD_DAYS = {
  [EARNINGS_PERIODS.daily]: 1,
  [EARNINGS_PERIODS.weekly]: 7,
  [EARNINGS_PERIODS.monthly]: 30,
  [EARNINGS_PERIODS.yearly]: 365,
} as const satisfies Record<EarningsPeriod, number>

export function getUpcomingInvestmentEarningsForDays(
  investment: Investment,
  days: number,
  asOfDate = new Date(),
): number {
  const derivedInvestment = getInvestmentDerivedValues(investment, asOfDate)

  return getSimpleInterest(
    derivedInvestment.originalAmount,
    derivedInvestment.annualRate,
    getUpcomingInvestmentEarningDays(derivedInvestment, days, asOfDate),
  )
}

export function getPeriodInvestmentEarningsForDays(
  investment: Investment,
  days: number,
  asOfDate = new Date(),
): number {
  const derivedInvestment = getInvestmentDerivedValues(investment, asOfDate)

  return getSimpleInterest(
    derivedInvestment.originalAmount,
    derivedInvestment.annualRate,
    getPeriodInvestmentEarningDays(derivedInvestment, days),
  )
}

export function getUpcomingInvestmentEarningsByPeriod(
  investment: Investment,
  period: EarningsPeriod,
  asOfDate = new Date(),
): number {
  return getUpcomingInvestmentEarningsForDays(
    investment,
    EARNINGS_PERIOD_DAYS[period],
    asOfDate,
  )
}

export function getPeriodInvestmentEarningsByPeriod(
  investment: Investment,
  period: EarningsPeriod,
  asOfDate = new Date(),
): number {
  return getPeriodInvestmentEarningsForDays(
    investment,
    EARNINGS_PERIOD_DAYS[period],
    asOfDate,
  )
}

export function getUpcomingInvestmentEarningsUntilDate(
  investment: Investment,
  targetDate: CalendarDateString,
  asOfDate = new Date(),
): number {
  return getUpcomingInvestmentEarningsForDays(
    investment,
    getDaysBetween(toDateString(asOfDate), targetDate),
    asOfDate,
  )
}

export function getUpcomingPortfolioEarningsSummary(
  investments: Investment[],
  asOfDate = new Date(),
): EarningsSummary {
  return {
    daily: getUpcomingPortfolioEarningsForDays(investments, 1, asOfDate),
    weekly: getUpcomingPortfolioEarningsForDays(investments, 7, asOfDate),
    monthly: getUpcomingPortfolioEarningsForDays(investments, 30, asOfDate),
    yearly: getUpcomingPortfolioEarningsForDays(investments, 365, asOfDate),
  }
}

export function getPeriodPortfolioEarningsSummary(
  investments: Investment[],
  asOfDate = new Date(),
): EarningsSummary {
  const activeInvestments = getActiveInvestments(investments, asOfDate)

  return {
    daily: getPeriodPortfolioEarningsForDays(activeInvestments, 1, asOfDate),
    weekly: getPeriodPortfolioEarningsForDays(activeInvestments, 7, asOfDate),
    monthly: getPeriodPortfolioEarningsForDays(activeInvestments, 30, asOfDate),
    yearly: getPeriodPortfolioEarningsForDays(activeInvestments, 365, asOfDate),
  }
}

export function getUpcomingPortfolioEarningsUntilDate(
  investments: Investment[],
  targetDate: CalendarDateString,
  asOfDate = new Date(),
): number {
  return getUpcomingPortfolioEarningsForDays(
    investments,
    getDaysBetween(toDateString(asOfDate), targetDate),
    asOfDate,
  )
}

export function getPortfolioEarningsSnapshot(
  investments: Investment[],
  asOfDate = new Date(),
  breakdownPeriod: EarningsPeriod = EARNINGS_PERIODS.monthly,
): PortfolioEarningsSnapshot {
  return {
    upcoming: {
      totals: getUpcomingPortfolioEarningsSummary(investments, asOfDate),
      breakdownPeriod,
      breakdown: getUpcomingInvestmentEarningsBreakdown(
        investments,
        breakdownPeriod,
        asOfDate,
      ),
    },
    period: {
      totals: getPeriodPortfolioEarningsSummary(investments, asOfDate),
      breakdownPeriod,
      breakdown: getPeriodInvestmentEarningsBreakdown(
        investments,
        breakdownPeriod,
        asOfDate,
      ),
    },
  }
}

export function getUpcomingInvestmentEarningsBreakdown(
  investments: Investment[],
  period: EarningsPeriod,
  asOfDate = new Date(),
): InvestmentEarningsBreakdown {
  const days = EARNINGS_PERIOD_DAYS[period]
  const activeInvestments = getActiveInvestments(investments, asOfDate)
  const portfolioEstimatedEarnings = getUpcomingPortfolioEarningsForDays(
    activeInvestments,
    days,
    asOfDate,
  )

  return buildInvestmentEarningsBreakdown(
    activeInvestments,
    (investment) =>
      getUpcomingInvestmentEarningsForDays(investment, days, asOfDate),
    portfolioEstimatedEarnings,
  )
}

export function getPeriodInvestmentEarningsBreakdown(
  investments: Investment[],
  period: EarningsPeriod,
  asOfDate = new Date(),
): InvestmentEarningsBreakdown {
  const activeInvestments = getActiveInvestments(investments, asOfDate)
  const days = EARNINGS_PERIOD_DAYS[period]
  const portfolioEstimatedEarnings = getPeriodPortfolioEarningsForDays(
    activeInvestments,
    days,
    asOfDate,
  )

  return buildInvestmentEarningsBreakdown(
    activeInvestments,
    (investment) => getPeriodInvestmentEarningsForDays(investment, days, asOfDate),
    portfolioEstimatedEarnings,
  )
}

export function getCustomDateEarningsTarget(
  asOfDate = new Date(),
  daysFromAsOfDate: number,
): CalendarDateString {
  return addCalendarDays(asOfDate, daysFromAsOfDate)
}

function getUpcomingPortfolioEarningsForDays(
  investments: Investment[],
  days: number,
  asOfDate: Date,
): number {
  return investments.reduce((total, investment) => {
    return (
      total + getUpcomingInvestmentEarningsForDays(investment, days, asOfDate)
    )
  }, 0)
}

function getPeriodPortfolioEarningsForDays(
  investments: Investment[],
  days: number,
  asOfDate: Date,
): number {
  return investments.reduce((total, investment) => {
    return total + getPeriodInvestmentEarningsForDays(investment, days, asOfDate)
  }, 0)
}

function buildInvestmentEarningsBreakdown(
  investments: Investment[],
  getInvestmentEarnings: (investment: Investment) => number,
  portfolioEstimatedEarnings: number,
): InvestmentEarningsBreakdown {
  return investments
    .map((investment) => {
      const estimatedEarnings = getInvestmentEarnings(investment)

      return {
        investmentId: investment.id,
        name: investment.name,
        institutionName: investment.institutionName,
        estimatedEarnings,
        percentage:
          portfolioEstimatedEarnings === 0
            ? 0
            : (estimatedEarnings / portfolioEstimatedEarnings) * 100,
      }
    })
    .sort((left, right) => right.estimatedEarnings - left.estimatedEarnings)
}

function getActiveInvestments(
  investments: Investment[],
  asOfDate: Date,
): Investment[] {
  return investments.filter((investment) => {
    return getDerivedStatus(investment, asOfDate) === DERIVED_STATUSES.active
  })
}

function getUpcomingInvestmentEarningDays(
  investment: DerivedInvestment,
  requestedDays: number,
  asOfDate: Date,
): number {
  if (requestedDays <= 0) {
    return 0
  }

  if (investment.type === INVESTMENT_TYPES.openEnded) {
    return requestedDays
  }

  const daysUntilMaturity = getDaysBetween(
    toDateString(asOfDate),
    investment.endDate,
  )

  return Math.max(0, Math.min(requestedDays, daysUntilMaturity))
}

function getPeriodInvestmentEarningDays(
  investment: DerivedInvestment,
  requestedDays: number,
): number {
  if (requestedDays <= 0) {
    return 0
  }

  if (investment.type === INVESTMENT_TYPES.openEnded) {
    return requestedDays
  }

  return Math.min(requestedDays, investment.totalTermDays)
}
