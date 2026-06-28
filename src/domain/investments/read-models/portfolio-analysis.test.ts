import { describe, expect, it } from "vitest"
import {
  fixedInvestment,
  openEndedInvestment,
} from "@/domain/investments/dev/investment-test-fixtures"
import { analyzePortfolio } from "@/domain/investments/read-models/portfolio-analysis"
import { resolveInvestment } from "@/domain/investments/read-models/resolved-investment"

describe("portfolio analysis", () => {
  it("aggregates resolved investments into portfolio totals", () => {
    const asOfDate = new Date("2026-01-16T12:00:00.000Z")
    const resolvedInvestments = [fixedInvestment, openEndedInvestment].map(
      (investment) => resolveInvestment(investment, asOfDate),
    )
    const analysis = analyzePortfolio(resolvedInvestments)

    expect(analysis.investments).toHaveLength(2)
    expect(analysis.investmentCount).toBe(2)
    expect(analysis.totalEstimatedCurrentValue).toBeCloseTo(46_680.042036)
    expect(analysis.totalEstimatedAccruedReturn).toBeCloseTo(180.042036)
    expect(analysis.activeInvestmentCount).toBe(2)
    expect(analysis.finishedInvestmentCount).toBe(0)
    expect(analysis.totalEstimatedDailyReturn).toBeCloseTo(12.006)
    expect(analysis.totalEstimatedMonthlyReturn).toBeCloseTo(360.18)
    expect(analysis.totalEstimatedYearlyReturn).toBeCloseTo(4_382.19)
  })

  it("excludes finished investments from current totals and earning pace", () => {
    const asOfDate = new Date("2026-06-05T12:00:00.000Z")
    const resolvedInvestments = [fixedInvestment, openEndedInvestment].map(
      (investment) => resolveInvestment(investment, asOfDate),
    )
    const analysis = analyzePortfolio(resolvedInvestments)

    expect(analysis.investmentCount).toBe(2)
    expect(analysis.activeInvestmentCount).toBe(1)
    expect(analysis.finishedInvestmentCount).toBe(1)
    expect(analysis.totalEstimatedAccruedReturn).toBeGreaterThan(0)
    expect(analysis.totalEstimatedCurrentValue).toBeCloseTo(
      resolvedInvestments[1]!.estimatedCurrentValue,
    )
    expect(analysis.totalEstimatedDailyReturn).toBeCloseTo(
      getExpectedActiveOnlyDailyReturn(
        resolvedInvestments[1]!.currentInvestedAmount,
      ),
    )
  })
})

function getExpectedActiveOnlyDailyReturn(currentInvestedAmount: number) {
  return (currentInvestedAmount * 7.3) / 100 / 365
}
