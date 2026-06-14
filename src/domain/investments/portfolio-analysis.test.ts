import { describe, expect, it } from "vitest"
import {
  fixedInvestment,
  openEndedInvestment,
} from "@/domain/investments/investment-test-fixtures"
import { analyzePortfolio } from "@/domain/investments/portfolio-analysis"

describe("portfolio analysis", () => {
  it("aggregates reusable investment analyses into portfolio totals", () => {
    const analysis = analyzePortfolio(
      [fixedInvestment, openEndedInvestment],
      new Date("2026-01-16T12:00:00.000Z"),
    )

    expect(analysis.investments).toHaveLength(2)
    expect(analysis.totalEstimatedCurrentValue).toBe(46_680)
    expect(analysis.totalEstimatedAccruedReturn).toBe(180)
    expect(analysis.activeInvestmentCount).toBe(2)
    expect(analysis.totalEstimatedDailyReturn).toBeCloseTo(12.006)
    expect(analysis.totalEstimatedMonthlyReturn).toBeCloseTo(360.18)
    expect(analysis.totalEstimatedYearlyReturn).toBeCloseTo(4_382.19)
  })
})
