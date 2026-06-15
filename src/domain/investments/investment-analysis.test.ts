import { describe, expect, it } from "vitest"
import {
  evolvingInvestment,
  fixedInvestment,
} from "@/domain/investments/investment-test-fixtures"
import { analyzeInvestment } from "@/domain/investments/investment-analysis"
import { DERIVED_STATUSES, INVESTMENT_TYPES } from "@/domain/investments"

describe("investment analysis", () => {
  it("builds the reusable as-of analysis for a fixed-term investment", () => {
    const analysis = analyzeInvestment(
      fixedInvestment,
      new Date("2026-01-16T12:00:00.000Z"),
    )

    expect(analysis.lastActiveDate).toBe("2026-01-16")
    expect(analysis.derivedStatus).toBe(DERIVED_STATUSES.active)
    expect(analysis.originalAmount).toBe(36_500)
    expect(analysis.totalContributedAmount).toBe(36_500)
    expect(analysis.currentInvestedAmount).toBe(36_500)
    expect(analysis.estimatedAccruedReturn).toBe(150)
    expect(analysis.estimatedCurrentValue).toBe(36_650)
    expect(analysis.currentAnnualRate).toBe(10)
    expect(analysis.balanceTimeline).toHaveLength(2)
    expect(analysis.currentLifecyclePeriod?.type).toBe(
      INVESTMENT_TYPES.fixedTerm,
    )
  })

  it("captures reinvested balances in the evolving investment analysis", () => {
    const analysis = analyzeInvestment(
      evolvingInvestment,
      new Date("2026-03-15T12:00:00.000Z"),
    )

    expect(analysis.structuralTimeline).toHaveLength(4)
    expect(analysis.balanceTimeline).toHaveLength(4)
    expect(analysis.totalContributedAmount).toBe(15_000)
    expect(analysis.currentInvestedAmount).toBeCloseTo(15_270.638968)
    expect(analysis.estimatedAccruedReturn).toBeCloseTo(270.638968)
    expect(analysis.estimatedCurrentValue).toBeCloseTo(15_270.638968)
    expect(analysis.currentAnnualRate).toBe(12)
  })

  it("snaps finished fixed-term analysis back to the last active date", () => {
    const analysis = analyzeInvestment(
      fixedInvestment,
      new Date("2026-02-15T12:00:00.000Z"),
    )

    expect(analysis.lastActiveDate).toBe("2026-01-30")
    expect(analysis.currentLifecyclePeriod?.type).toBe(
      INVESTMENT_TYPES.fixedTerm,
    )
  })
})
