import { INVESTMENT_TYPES } from "@/domain/investments/constants"
import {
  addCalendarDays,
  getDaysBetween,
  toDateString,
} from "@/domain/investments/dates"
import { getSimpleInterest } from "@/domain/investments/interest"
import type { CalendarDateString, Investment } from "@/domain/investments/types"

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

export interface InvestmentEarningsContribution {
  investmentId: string
  name: string
  institutionName: string
  estimatedEarnings: number
  percentage: number
}

export type InvestmentEarningsBreakdown = InvestmentEarningsContribution[]

export interface PortfolioEarningsView {
  totals: EarningsSummary
  breakdownPeriod: EarningsPeriod
  byInvestment: InvestmentEarningsBreakdown
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
  return getSimpleInterest(
    investment.originalAmount,
    investment.annualRate,
    getUpcomingInvestmentEarningDays(investment, days, asOfDate),
  )
}

export function getPeriodInvestmentEarningsForDays(
  investment: Investment,
  days: number,
): number {
  return getSimpleInterest(
    investment.originalAmount,
    investment.annualRate,
    getPeriodInvestmentEarningDays(investment, days),
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
): number {
  return getPeriodInvestmentEarningsForDays(
    investment,
    EARNINGS_PERIOD_DAYS[period],
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
): EarningsSummary {
  return {
    daily: getPeriodPortfolioEarningsForDays(investments, 1),
    weekly: getPeriodPortfolioEarningsForDays(investments, 7),
    monthly: getPeriodPortfolioEarningsForDays(investments, 30),
    yearly: getPeriodPortfolioEarningsForDays(investments, 365),
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
      byInvestment: getUpcomingInvestmentEarningsContributionBreakdown(
        investments,
        breakdownPeriod,
        asOfDate,
      ),
    },
    period: {
      totals: getPeriodPortfolioEarningsSummary(investments),
      breakdownPeriod,
      byInvestment: getPeriodInvestmentEarningsContributionBreakdown(
        investments,
        breakdownPeriod,
      ),
    },
  }
}

export function getUpcomingInvestmentEarningsContributionBreakdown(
  investments: Investment[],
  period: EarningsPeriod,
  asOfDate = new Date(),
): InvestmentEarningsContribution[] {
  const days = EARNINGS_PERIOD_DAYS[period]
  const portfolioEstimatedEarnings = getUpcomingPortfolioEarningsForDays(
    investments,
    days,
    asOfDate,
  )

  return buildContributionBreakdown(
    investments,
    (investment) =>
      getUpcomingInvestmentEarningsForDays(investment, days, asOfDate),
    portfolioEstimatedEarnings,
  )
}

export function getPeriodInvestmentEarningsContributionBreakdown(
  investments: Investment[],
  period: EarningsPeriod,
): InvestmentEarningsContribution[] {
  const days = EARNINGS_PERIOD_DAYS[period]
  const portfolioEstimatedEarnings = getPeriodPortfolioEarningsForDays(
    investments,
    days,
  )

  return buildContributionBreakdown(
    investments,
    (investment) => getPeriodInvestmentEarningsForDays(investment, days),
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
): number {
  return investments.reduce((total, investment) => {
    return total + getPeriodInvestmentEarningsForDays(investment, days)
  }, 0)
}

function buildContributionBreakdown(
  investments: Investment[],
  getInvestmentEarnings: (investment: Investment) => number,
  portfolioEstimatedEarnings: number,
): InvestmentEarningsContribution[] {
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

function getUpcomingInvestmentEarningDays(
  investment: Investment,
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

  return Math.min(requestedDays, daysUntilMaturity)
}

function getPeriodInvestmentEarningDays(
  investment: Investment,
  requestedDays: number,
): number {
  if (requestedDays <= 0) {
    return 0
  }

  if (investment.type === INVESTMENT_TYPES.openEnded) {
    return requestedDays
  }

  return Math.min(
    requestedDays,
    getDaysBetween(investment.startDate, investment.endDate),
  )
}
