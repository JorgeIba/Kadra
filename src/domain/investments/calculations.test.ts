import { describe, expect, it } from "vitest"
import {
  CURRENCIES,
  DERIVED_STATUSES,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
} from "@/domain/investments/constants"
import {
  getDerivedStatus,
  getInvestmentDerivedValues,
  getInvestmentSummary,
  getPortfolioEstimatedCurrentValue,
  getPortfolioEstimatedDailyReturn,
} from "@/domain/investments/calculations"
import type { Investment } from "@/domain/investments/types"

const fixedInvestment = {
  id: "investment-1",
  name: "Fixed test",
  institutionName: "Test institution",
  type: INVESTMENT_TYPES.fixedTerm,
  originalAmount: 36_500,
  annualRate: 10,
  currency: CURRENCIES.mxn,
  paymentFrequency: PAYMENT_FREQUENCIES.monthly,
  reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
  startDate: "2026-01-01",
  endDate: "2026-01-31",
  createdAt: "2026-01-01T18:00:00.000Z",
  updatedAt: "2026-01-01T18:00:00.000Z",
} satisfies Investment

const openEndedInvestment = {
  id: "investment-2",
  name: "Open test",
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

describe("investment calculations", () => {
  it("derives fixed-term status from the end date", () => {
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

    expect(values.daysActive).toBe(15)
    expect(values.estimatedCurrentValue).toBe(36_650)
    expect(
      "progressPercentage" in values ? values.progressPercentage : undefined,
    ).toBe(50)
    expect(
      "projectedValueAtEndDate" in values
        ? values.projectedValueAtEndDate
        : undefined,
    ).toBe(36_800)
  })

  it("returns a compact investment summary for lists", () => {
    expect(
      getInvestmentSummary(
        fixedInvestment,
        new Date("2026-01-16T12:00:00.000Z"),
      ),
    ).toMatchObject({
      id: "investment-1",
      name: "Fixed test",
      estimatedCurrentValue: 36_650,
      progressPercentage: 50,
      derivedStatus: DERIVED_STATUSES.active,
    })
  })

  it("calculates portfolio-level estimates", () => {
    const investments = [fixedInvestment, openEndedInvestment]

    expect(
      getPortfolioEstimatedCurrentValue(
        investments,
        new Date("2026-01-16T12:00:00.000Z"),
      ),
    ).toBe(46_680)
    expect(getPortfolioEstimatedDailyReturn(investments)).toBe(12)
  })
})
