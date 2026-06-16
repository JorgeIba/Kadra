import { describe, expect, it } from "vitest"
import {
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
      type: INVESTMENT_TYPES.fixedTerm,
      paymentFrequency: PAYMENT_FREQUENCIES.atMaturity,
      reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
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

const contributedOpenEndedInvestment = {
  ...openEndedInvestment,
  id: "investment-contributed-open",
  name: "Open with extra contribution",
  contributions: [
    {
      id: "contribution-1",
      amount: 10_000,
      contributionDate: "2026-01-01",
      createdAt: "2026-01-01T18:00:00.000Z",
    },
    {
      id: "contribution-2",
      amount: 5_000,
      contributionDate: "2026-01-10",
      createdAt: "2026-01-10T18:00:00.000Z",
    },
  ],
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

  it("projects earnings from resolved history instead of only the original contribution", () => {
    expect(
      getPeriodInvestmentEarningsByPeriod(
        contributedOpenEndedInvestment,
        EARNINGS_PERIODS.monthly,
        asOfDate,
      ),
    ).toBeCloseTo(81.21637848684077)

    expect(
      getUpcomingInvestmentEarningsByPeriod(
        contributedOpenEndedInvestment,
        EARNINGS_PERIODS.monthly,
        asOfDate,
      ),
    ).toBeCloseTo(90.47838643770228)
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
    ).toBeCloseTo(60.03405485571966)
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
