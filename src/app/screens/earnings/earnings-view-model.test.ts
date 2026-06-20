import { describe, expect, it } from "vitest"
import {
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
} from "@/domain/investments"
import {
  EARNINGS_PERIODS,
  getCustomDateEarningsTarget,
  getPeriodPortfolioEarningsSummary,
  getPortfolioEarningsSnapshot,
  getUpcomingPortfolioEarningsSummary,
} from "@/app/screens/earnings/earnings-view-model"
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
  contributionEvents: [
    {
      id: "contribution-event-1",
      amount: 20_000,
      effectiveDate: "2025-11-01",
      createdAt: "2025-11-01T18:00:00.000Z",
    },
  ],
  rateEvents: [
    {
      id: "rate-event-1",
      annualRate: 11,
      effectiveDate: "2025-11-01",
      createdAt: "2025-11-01T18:00:00.000Z",
    },
  ],
  lifecycleEvents: [
    {
      id: "lifecycle-event-1",
      type: INVESTMENT_TYPES.fixedTerm,
      paymentFrequency: PAYMENT_FREQUENCIES.atMaturity,
      reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
      effectiveDate: "2025-11-01",
      maturityDate: "2025-12-01",
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
  it("calculates portfolio upcoming earnings across common periods", () => {
    const summary = getUpcomingPortfolioEarningsSummary(investments, asOfDate)

    expect(summary.daily).toBeCloseTo(12.006008407282934)
    expect(summary.weekly).toBeCloseTo(84.05048689527212)
    expect(summary.monthly).toBeCloseTo(210.35510116597834)
    expect(summary.yearly).toBeCloseTo(909.5017152386336)
  })

  it("calculates portfolio period earnings across common periods", () => {
    const summary = getPeriodPortfolioEarningsSummary(investments, asOfDate)

    expect(summary.daily).toBeCloseTo(12)
    expect(summary.weekly).toBeCloseTo(84.00840280055854)
    expect(summary.monthly).toBeCloseTo(360.1743252389315)
    expect(summary.yearly).toBeCloseTo(1_057.2268515731776)
  })

  it("excludes matured investments from period earnings and breakdowns", () => {
    const mixedInvestments = [maturedFixedInvestment, activeOpenEndedInvestment]
    const snapshot = getPortfolioEarningsSnapshot(
      mixedInvestments,
      asOfDate,
      EARNINGS_PERIODS.monthly,
    )

    const summary = getPeriodPortfolioEarningsSummary(
      mixedInvestments,
      asOfDate,
    )

    expect(summary.daily).toBeCloseTo(2)
    expect(summary.weekly).toBeCloseTo(14.008402800558542)
    expect(summary.monthly).toBeCloseTo(60.17432523893149)
    expect(summary.yearly).toBeCloseTo(757.2268515731776)
    expect(snapshot.period.breakdown).toHaveLength(1)
    expect(snapshot.period.breakdown[0]).toMatchObject({
      investmentId: "investment-open",
      name: "Open daily",
      institutionName: "Test institution",
      percentage: 100,
    })
    expect(snapshot.period.breakdown[0]?.estimatedEarnings).toBeCloseTo(
      60.17432523893149,
    )
  })

  it("returns upcoming and period earnings breakdowns in one snapshot", () => {
    const snapshot = getPortfolioEarningsSnapshot(
      investments,
      asOfDate,
      EARNINGS_PERIODS.monthly,
    )

    expect(snapshot.upcoming.totals.monthly).toBeCloseTo(210.35510116597834)
    expect(snapshot.period.totals.monthly).toBeCloseTo(360.1743252389315)
    expect(snapshot.upcoming.breakdown).toHaveLength(2)
    expect(snapshot.upcoming.breakdown[0]).toMatchObject({
      investmentId: "investment-fixed",
      name: "Fixed 30 days",
      institutionName: "Test institution",
    })
    expect(snapshot.upcoming.breakdown[0]?.estimatedEarnings).toBeCloseTo(150)
    expect(snapshot.upcoming.breakdown[0]?.percentage).toBeCloseTo(
      71.30799261276016,
    )
    expect(snapshot.upcoming.breakdown[1]).toMatchObject({
      investmentId: "investment-open",
      name: "Open daily",
      institutionName: "Test institution",
    })
    expect(snapshot.upcoming.breakdown[1]?.estimatedEarnings).toBeCloseTo(
      60.35510116597834,
    )
    expect(snapshot.upcoming.breakdown[1]?.percentage).toBeCloseTo(
      28.692007387239837,
    )
    expect(snapshot.period.breakdown).toHaveLength(2)
    expect(snapshot.period.breakdown[0]).toMatchObject({
      investmentId: "investment-fixed",
      name: "Fixed 30 days",
      institutionName: "Test institution",
    })
    expect(snapshot.period.breakdown[0]?.estimatedEarnings).toBeCloseTo(300)
    expect(snapshot.period.breakdown[0]?.percentage).toBeCloseTo(
      83.2930004610256,
    )
    expect(snapshot.period.breakdown[1]).toMatchObject({
      investmentId: "investment-open",
      name: "Open daily",
      institutionName: "Test institution",
    })
    expect(snapshot.period.breakdown[1]?.estimatedEarnings).toBeCloseTo(
      60.17432523893149,
    )
    expect(snapshot.period.breakdown[1]?.percentage).toBeCloseTo(
      16.70699953897439,
    )
  })

  it("excludes inactive investments from the upcoming breakdown", () => {
    const snapshot = getPortfolioEarningsSnapshot(
      [maturedFixedInvestment, ...investments],
      asOfDate,
      EARNINGS_PERIODS.monthly,
    )

    expect(snapshot.upcoming.breakdown).toHaveLength(2)
    expect(snapshot.upcoming.breakdown[0]).toMatchObject({
      investmentId: "investment-fixed",
      name: "Fixed 30 days",
      institutionName: "Test institution",
    })
    expect(snapshot.upcoming.breakdown[0]?.estimatedEarnings).toBeCloseTo(150)
    expect(snapshot.upcoming.breakdown[0]?.percentage).toBeCloseTo(
      71.30799261276016,
    )
    expect(snapshot.upcoming.breakdown[1]).toMatchObject({
      investmentId: "investment-open",
      name: "Open daily",
      institutionName: "Test institution",
    })
    expect(snapshot.upcoming.breakdown[1]?.estimatedEarnings).toBeCloseTo(
      60.35510116597834,
    )
    expect(snapshot.upcoming.breakdown[1]?.percentage).toBeCloseTo(
      28.692007387239837,
    )
  })

  it("builds deterministic custom target dates from an as-of date", () => {
    expect(getCustomDateEarningsTarget(asOfDate, 90)).toBe("2026-04-16")
  })
})
