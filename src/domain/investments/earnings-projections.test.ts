import { describe, expect, it } from "vitest"
import {
  CURRENCIES,
  EARNINGS_PERIODS,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
} from "@/domain/investments"
import {
  getCustomDateEarningsTarget,
  getPeriodInvestmentEarningsByPeriod,
  getPeriodPortfolioEarningsSummary,
  getPortfolioEarningsSnapshot,
  getUpcomingInvestmentEarningsByPeriod,
  getUpcomingInvestmentEarningsUntilDate,
  getUpcomingPortfolioEarningsSummary,
  getUpcomingPortfolioEarningsUntilDate,
} from "@/domain/investments/earnings-projections"
import type { Investment } from "@/domain/investments/types"

const fixedInvestment = {
  id: "investment-fixed",
  name: "Fixed 30 days",
  institutionName: "Test institution",
  type: INVESTMENT_TYPES.fixedTerm,
  originalAmount: 36_500,
  annualRate: 10,
  currency: CURRENCIES.mxn,
  paymentFrequency: PAYMENT_FREQUENCIES.atMaturity,
  reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
  startDate: "2026-01-01",
  endDate: "2026-01-31",
  createdAt: "2026-01-01T18:00:00.000Z",
  updatedAt: "2026-01-01T18:00:00.000Z",
} satisfies Investment

const openEndedInvestment = {
  id: "investment-open",
  name: "Open daily",
  institutionName: "Test institution",
  type: INVESTMENT_TYPES.openEnded,
  originalAmount: 10_000,
  annualRate: 7.3,
  currency: CURRENCIES.mxn,
  paymentFrequency: PAYMENT_FREQUENCIES.daily,
  reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
  startDate: "2026-01-01",
  createdAt: "2026-01-01T18:00:00.000Z",
  updatedAt: "2026-01-01T18:00:00.000Z",
} satisfies Investment

const investments = [fixedInvestment, openEndedInvestment]
const asOfDate = new Date("2026-01-16T12:00:00.000Z")

describe("earnings exploration calculations", () => {
  it("keeps upcoming and period daily estimates aligned for active investments", () => {
    expect(
      getUpcomingInvestmentEarningsByPeriod(
        fixedInvestment,
        EARNINGS_PERIODS.daily,
        asOfDate,
      ),
    ).toBe(10)

    expect(
      getPeriodInvestmentEarningsByPeriod(
        fixedInvestment,
        EARNINGS_PERIODS.daily,
      ),
    ).toBe(10)
  })

  it("caps upcoming fixed-term earnings by remaining time to maturity", () => {
    expect(
      getUpcomingInvestmentEarningsByPeriod(
        fixedInvestment,
        EARNINGS_PERIODS.monthly,
        asOfDate,
      ),
    ).toBe(150)
  })

  it("caps period fixed-term earnings by full term length", () => {
    expect(
      getPeriodInvestmentEarningsByPeriod(
        fixedInvestment,
        EARNINGS_PERIODS.monthly,
      ),
    ).toBe(300)
  })

  it("calculates portfolio upcoming earnings across common periods", () => {
    expect(getUpcomingPortfolioEarningsSummary(investments, asOfDate)).toEqual({
      daily: 12,
      weekly: 84,
      monthly: 210,
      yearly: 880,
    })
  })

  it("calculates portfolio period earnings across common periods", () => {
    expect(getPeriodPortfolioEarningsSummary(investments)).toEqual({
      daily: 12,
      weekly: 84,
      monthly: 360,
      yearly: 1_030,
    })
  })

  it("estimates upcoming earnings until a custom target date", () => {
    expect(
      getUpcomingInvestmentEarningsUntilDate(
        fixedInvestment,
        "2026-01-21",
        asOfDate,
      ),
    ).toBe(50)
    expect(
      getUpcomingPortfolioEarningsUntilDate(
        investments,
        "2026-01-21",
        asOfDate,
      ),
    ).toBe(60)
  })

  it("returns upcoming and period contribution breakdowns in one snapshot", () => {
    const snapshot = getPortfolioEarningsSnapshot(
      investments,
      asOfDate,
      EARNINGS_PERIODS.monthly,
    )

    expect(snapshot.upcoming.totals.monthly).toBe(210)
    expect(snapshot.period.totals.monthly).toBe(360)
    expect(snapshot.upcoming.byInvestment).toEqual([
      {
        investmentId: "investment-fixed",
        name: "Fixed 30 days",
        institutionName: "Test institution",
        estimatedEarnings: 150,
        percentage: 71.42857142857143,
      },
      {
        investmentId: "investment-open",
        name: "Open daily",
        institutionName: "Test institution",
        estimatedEarnings: 60,
        percentage: 28.57142857142857,
      },
    ])
    expect(snapshot.period.byInvestment).toEqual([
      {
        investmentId: "investment-fixed",
        name: "Fixed 30 days",
        institutionName: "Test institution",
        estimatedEarnings: 300,
        percentage: 83.33333333333334,
      },
      {
        investmentId: "investment-open",
        name: "Open daily",
        institutionName: "Test institution",
        estimatedEarnings: 60,
        percentage: 16.666666666666664,
      },
    ])
  })

  it("builds deterministic custom target dates from an as-of date", () => {
    expect(getCustomDateEarningsTarget(asOfDate, 90)).toBe("2026-04-16")
  })
})
