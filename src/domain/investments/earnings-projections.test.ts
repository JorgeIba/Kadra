import { describe, expect, it } from "vitest"
import { EARNINGS_PERIODS } from "@/domain/investments"
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
import {
  fixedInvestment,
  openEndedInvestment,
} from "@/domain/investments/investment-test-fixtures"
import type { Investment } from "@/domain/investments/types"

const maturedFixedInvestment = {
  ...fixedInvestment,
  id: "investment-matured",
  name: "Finished fixed term",
  institutionName: "Finished institution",
  createdAt: "2025-11-01T18:00:00.000Z",
  updatedAt: "2025-11-01T18:00:00.000Z",
  contributions: [
    {
      id: "contribution-1",
      amount: 20_000,
      contributionDate: "2025-11-01",
      createdAt: "2025-11-01T18:00:00.000Z",
    },
  ],
  ratePeriods: [
    {
      id: "rate-period-1",
      annualRate: 11,
      startDate: "2025-11-01",
      createdAt: "2025-11-01T18:00:00.000Z",
    },
  ],
  lifecyclePeriods: [
    {
      id: "lifecycle-period-1",
      type: "fixed-term",
      paymentFrequency: "at-maturity",
      reinvestmentBehavior: "to-cash",
      startDate: "2025-11-01",
      endDate: "2025-12-01",
      createdAt: "2025-11-01T18:00:00.000Z",
    },
  ],
} satisfies Investment

const activeFixedInvestment = {
  ...fixedInvestment,
  id: "investment-fixed",
  name: "Fixed 30 days",
} satisfies Investment

const activeOpenEndedInvestment = {
  ...openEndedInvestment,
  id: "investment-open",
  name: "Open daily",
} satisfies Investment

const investments = [activeFixedInvestment, activeOpenEndedInvestment]
const asOfDate = new Date("2026-01-16T12:00:00.000Z")

describe("earnings exploration calculations", () => {
  it("keeps upcoming and period daily estimates aligned for active investments", () => {
    expect(
      getUpcomingInvestmentEarningsByPeriod(
        activeFixedInvestment,
        EARNINGS_PERIODS.daily,
        asOfDate,
      ),
    ).toBe(10)

    expect(
      getPeriodInvestmentEarningsByPeriod(
        activeFixedInvestment,
        EARNINGS_PERIODS.daily,
        asOfDate,
      ),
    ).toBe(10)
  })

  it("caps upcoming fixed-term earnings by remaining time to maturity", () => {
    expect(
      getUpcomingInvestmentEarningsByPeriod(
        activeFixedInvestment,
        EARNINGS_PERIODS.monthly,
        asOfDate,
      ),
    ).toBe(150)
  })

  it("caps period fixed-term earnings by full term length", () => {
    expect(
      getPeriodInvestmentEarningsByPeriod(
        activeFixedInvestment,
        EARNINGS_PERIODS.monthly,
        asOfDate,
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
    expect(getPeriodPortfolioEarningsSummary(investments, asOfDate)).toEqual({
      daily: 12,
      weekly: 84,
      monthly: 360,
      yearly: 1_030,
    })
  })

  it("excludes matured investments from period earnings and breakdowns", () => {
    const mixedInvestments = [maturedFixedInvestment, activeOpenEndedInvestment]
    const snapshot = getPortfolioEarningsSnapshot(
      mixedInvestments,
      asOfDate,
      EARNINGS_PERIODS.monthly,
    )

    expect(
      getPeriodPortfolioEarningsSummary(mixedInvestments, asOfDate),
    ).toEqual({
      daily: 2,
      weekly: 14,
      monthly: 60,
      yearly: 730,
    })
    expect(snapshot.period.breakdown).toEqual([
      {
        investmentId: "investment-open",
        name: "Open daily",
        institutionName: "Test institution",
        estimatedEarnings: 60,
        percentage: 100,
      },
    ])
  })

  it("estimates upcoming earnings until a custom target date", () => {
    expect(
      getUpcomingInvestmentEarningsUntilDate(
        activeFixedInvestment,
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

  it("returns upcoming and period earnings breakdowns in one snapshot", () => {
    const snapshot = getPortfolioEarningsSnapshot(
      investments,
      asOfDate,
      EARNINGS_PERIODS.monthly,
    )

    expect(snapshot.upcoming.totals.monthly).toBe(210)
    expect(snapshot.period.totals.monthly).toBe(360)
    expect(snapshot.upcoming.breakdown).toEqual([
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
    expect(snapshot.period.breakdown).toEqual([
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

  it("excludes inactive investments from the upcoming breakdown", () => {
    const snapshot = getPortfolioEarningsSnapshot(
      [maturedFixedInvestment, ...investments],
      asOfDate,
      EARNINGS_PERIODS.monthly,
    )

    expect(snapshot.upcoming.breakdown).toEqual([
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
  })

  it("builds deterministic custom target dates from an as-of date", () => {
    expect(getCustomDateEarningsTarget(asOfDate, 90)).toBe("2026-04-16")
  })
})
