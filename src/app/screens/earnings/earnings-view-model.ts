import { DERIVED_STATUSES } from "@/domain/investments/model/constants"
import { getDerivedStatus } from "@/domain/investments/events/lifecycle-periods"
import {
  addCalendarDays,
  DAY_COUNTS,
} from "@/domain/investments/calculations/dates"
import {
  getPeriodInvestmentProjectedEarningsForDays,
  getUpcomingInvestmentProjectedEarningsForDays,
} from "@/domain/investments/calculations/investment-projections"
import type {
  CalendarDateString,
  Investment,
} from "@/domain/investments/model/types"

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
  [EARNINGS_PERIODS.daily]: DAY_COUNTS.day,
  [EARNINGS_PERIODS.weekly]: DAY_COUNTS.week,
  [EARNINGS_PERIODS.monthly]: DAY_COUNTS.month,
  [EARNINGS_PERIODS.yearly]: DAY_COUNTS.year,
} as const satisfies Record<EarningsPeriod, number>

export function getUpcomingPortfolioEarningsSummary(
  investments: Investment[],
  asOfDate = new Date(),
): EarningsSummary {
  return {
    daily: getUpcomingPortfolioEarningsForDays(
      investments,
      DAY_COUNTS.day,
      asOfDate,
    ),
    weekly: getUpcomingPortfolioEarningsForDays(
      investments,
      DAY_COUNTS.week,
      asOfDate,
    ),
    monthly: getUpcomingPortfolioEarningsForDays(
      investments,
      DAY_COUNTS.month,
      asOfDate,
    ),
    yearly: getUpcomingPortfolioEarningsForDays(
      investments,
      DAY_COUNTS.year,
      asOfDate,
    ),
  }
}

export function getPeriodPortfolioEarningsSummary(
  investments: Investment[],
  asOfDate = new Date(),
): EarningsSummary {
  const activeInvestments = getActiveInvestments(investments, asOfDate)

  return {
    daily: getPeriodPortfolioEarningsForDays(
      activeInvestments,
      DAY_COUNTS.day,
      asOfDate,
    ),
    weekly: getPeriodPortfolioEarningsForDays(
      activeInvestments,
      DAY_COUNTS.week,
      asOfDate,
    ),
    monthly: getPeriodPortfolioEarningsForDays(
      activeInvestments,
      DAY_COUNTS.month,
      asOfDate,
    ),
    yearly: getPeriodPortfolioEarningsForDays(
      activeInvestments,
      DAY_COUNTS.year,
      asOfDate,
    ),
  }
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
      getUpcomingInvestmentProjectedEarningsForDays(investment, days, asOfDate),
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
    (investment) =>
      getPeriodInvestmentProjectedEarningsForDays(investment, days, asOfDate),
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
      total +
      getUpcomingInvestmentProjectedEarningsForDays(investment, days, asOfDate)
    )
  }, 0)
}

function getPeriodPortfolioEarningsForDays(
  investments: Investment[],
  days: number,
  asOfDate: Date,
): number {
  return investments.reduce((total, investment) => {
    return (
      total +
      getPeriodInvestmentProjectedEarningsForDays(investment, days, asOfDate)
    )
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
