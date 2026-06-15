import { describe, expect, it } from "vitest"
import {
  DERIVED_STATUSES,
  INVESTMENT_TYPES,
} from "@/domain/investments/constants"
import {
  fixedInvestment,
  openEndedInvestment,
} from "@/domain/investments/investment-test-fixtures"
import {
  getInvestmentSummary,
  resolveInvestment,
} from "@/domain/investments/resolved-investment"

describe("resolved investment", () => {
  it("builds the current read model for a fixed-term investment", () => {
    const values = resolveInvestment(
      fixedInvestment,
      new Date("2026-01-16T12:00:00.000Z"),
    )

    expect(values).toMatchObject({
      id: "investment-1",
      name: "Fixed test",
      type: INVESTMENT_TYPES.fixedTerm,
      originalAmount: 36_500,
      currentInvestedAmount: 36_500,
      annualRate: 10,
      currentLifecycleDaysActive: 15,
      estimatedAccruedReturn: 150,
      estimatedCurrentValue: 36_650,
      derivedStatus: DERIVED_STATUSES.active,
    })

    if (values.type !== INVESTMENT_TYPES.fixedTerm) {
      throw new Error("Expected fixed-term derived values")
    }

    expect(values.progressPercentage).toBe(50)
    expect(values.projectedValueAtEndDate).toBe(36_800)
  })

  it("builds the current read model for an open-ended investment", () => {
    const values = resolveInvestment(
      openEndedInvestment,
      new Date("2026-01-16T12:00:00.000Z"),
    )

    expect(values).toMatchObject({
      id: "investment-2",
      type: INVESTMENT_TYPES.openEnded,
      annualRate: 7.3,
      derivedStatus: DERIVED_STATUSES.active,
    })
    expect(values.currentInvestedAmount).toBeCloseTo(10_030.042036)
    expect(values.estimatedAccruedReturn).toBeCloseTo(30.042036)
    expect(values.estimatedCurrentValue).toBeCloseTo(10_030.042036)
  })

  it("returns a compact summary for list views", () => {
    const summary = getInvestmentSummary(
      fixedInvestment,
      new Date("2026-01-16T12:00:00.000Z"),
    )

    expect(summary).toMatchObject({
      id: "investment-1",
      name: "Fixed test",
      type: INVESTMENT_TYPES.fixedTerm,
      originalAmount: 36_500,
      annualRate: 10,
      estimatedCurrentValue: 36_650,
      derivedStatus: DERIVED_STATUSES.active,
    })
  })
})
