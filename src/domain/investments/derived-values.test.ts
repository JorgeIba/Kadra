import { describe, expect, it } from "vitest"
import {
  CURRENCIES,
  DERIVED_STATUSES,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
} from "@/domain/investments/constants"
import {
  getActiveInvestmentCount,
  getDerivedStatus,
  getInvestmentDerivedValues,
  getInvestmentSummary,
  getPortfolioEstimatedAccruedReturn,
  getPortfolioEstimatedCurrentValue,
  getPortfolioEstimatedDailyReturn,
  getPortfolioEstimatedMonthlyReturn,
  getPortfolioEstimatedYearlyReturn,
} from "@/domain/investments/derived-values"
import type { Investment } from "@/domain/investments/types"

const fixedInvestment = {
  id: "investment-1",
  name: "Fixed test",
  institutionName: "Test institution",
  currency: CURRENCIES.mxn,
  createdAt: "2026-01-01T18:00:00.000Z",
  updatedAt: "2026-01-01T18:00:00.000Z",
  contributions: [
    {
      id: "contribution-1",
      amount: 36_500,
      contributionDate: "2026-01-01",
      createdAt: "2026-01-01T18:00:00.000Z",
    },
  ],
  ratePeriods: [
    {
      id: "rate-period-1",
      annualRate: 10,
      startDate: "2026-01-01",
      createdAt: "2026-01-01T18:00:00.000Z",
    },
  ],
  lifecyclePeriods: [
    {
      id: "lifecycle-period-1",
      type: INVESTMENT_TYPES.fixedTerm,
      paymentFrequency: PAYMENT_FREQUENCIES.monthly,
      reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
      startDate: "2026-01-01",
      endDate: "2026-01-31",
      createdAt: "2026-01-01T18:00:00.000Z",
    },
  ],
} satisfies Investment

const openEndedInvestment = {
  id: "investment-2",
  name: "Open test",
  institutionName: "Test institution",
  currency: CURRENCIES.mxn,
  createdAt: "2026-01-01T18:00:00.000Z",
  updatedAt: "2026-01-01T18:00:00.000Z",
  contributions: [
    {
      id: "contribution-1",
      amount: 10_000,
      contributionDate: "2026-01-01",
      createdAt: "2026-01-01T18:00:00.000Z",
    },
  ],
  ratePeriods: [
    {
      id: "rate-period-1",
      annualRate: 7.3,
      startDate: "2026-01-01",
      createdAt: "2026-01-01T18:00:00.000Z",
    },
  ],
  lifecyclePeriods: [
    {
      id: "lifecycle-period-1",
      type: INVESTMENT_TYPES.openEnded,
      paymentFrequency: PAYMENT_FREQUENCIES.daily,
      reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
      startDate: "2026-01-01",
      createdAt: "2026-01-01T18:00:00.000Z",
    },
  ],
} satisfies Investment

describe("investment calculations", () => {
  it("derives fixed-term status from the latest lifecycle period", () => {
    expect(
      getDerivedStatus(fixedInvestment, new Date("2026-01-30T12:00:00.000Z")),
    ).toBe(DERIVED_STATUSES.active)
    expect(
      getDerivedStatus(fixedInvestment, new Date("2026-01-31T12:00:00.000Z")),
    ).toBe(DERIVED_STATUSES.finished)
  })

  it("keeps open-ended investments active for MVP", () => {
    expect(
      getDerivedStatus(
        openEndedInvestment,
        new Date("2027-01-01T12:00:00.000Z"),
      ),
    ).toBe(DERIVED_STATUSES.active)
  })

  it("calculates fixed-term progress and projected end value", () => {
    const values = getInvestmentDerivedValues(
      fixedInvestment,
      new Date("2026-01-16T12:00:00.000Z"),
    )

    expect(values.currentLifecycleDaysActive).toBe(15)
    expect(values.currentInvestedAmount).toBe(36_500)
    expect(values.estimatedCurrentValue).toBe(36_650)
    expect(values.type).toBe(INVESTMENT_TYPES.fixedTerm)

    if (values.type !== INVESTMENT_TYPES.fixedTerm) {
      throw new Error("Expected fixed-term derived values")
    }

    expect(values.progressPercentage).toBe(50)
    expect(values.projectedValueAtEndDate).toBe(36_800)
  })

  it("returns a compact investment summary for lists", () => {
    const summary = getInvestmentSummary(
      fixedInvestment,
      new Date("2026-01-16T12:00:00.000Z"),
    )

    if (summary.type !== INVESTMENT_TYPES.fixedTerm) {
      throw new Error("Expected fixed-term investment summary")
    }

    expect(summary).toMatchObject({
      id: "investment-1",
      name: "Fixed test",
      type: INVESTMENT_TYPES.fixedTerm,
      originalAmount: 36_500,
      estimatedCurrentValue: 36_650,
      progressPercentage: 50,
      derivedStatus: DERIVED_STATUSES.active,
    })
  })

  it("calculates portfolio-level estimates", () => {
    const investments = [fixedInvestment, openEndedInvestment]
    const asOfDate = new Date("2026-01-16T12:00:00.000Z")

    expect(getPortfolioEstimatedCurrentValue(investments, asOfDate)).toBe(
      46_680,
    )
    expect(getPortfolioEstimatedDailyReturn(investments, asOfDate)).toBeCloseTo(
      12.006,
    )
    expect(
      getPortfolioEstimatedMonthlyReturn(investments, asOfDate),
    ).toBeCloseTo(360.18)
    expect(
      getPortfolioEstimatedYearlyReturn(investments, asOfDate),
    ).toBeCloseTo(4_382.19)
  })

  it("calculates portfolio accrued return and active investment count", () => {
    const investments = [fixedInvestment, openEndedInvestment]
    const asOfDate = new Date("2026-01-16T12:00:00.000Z")

    expect(getPortfolioEstimatedAccruedReturn(investments, asOfDate)).toBe(180)
    expect(getActiveInvestmentCount(investments, asOfDate)).toBe(2)
  })
})
