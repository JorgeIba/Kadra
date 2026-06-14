import { describe, expect, it } from "vitest"
import {
  fixedInvestment,
  openEndedInvestment,
} from "@/domain/investments/investment-test-fixtures"
import {
  getActiveInvestmentCount,
  getPortfolioEstimatedAccruedReturn,
  getPortfolioEstimatedCurrentValue,
  getPortfolioEstimatedDailyReturn,
  getPortfolioEstimatedMonthlyReturn,
  getPortfolioEstimatedYearlyReturn,
} from "@/domain/investments/portfolio-values"

const investments = [fixedInvestment, openEndedInvestment]

describe("portfolio values", () => {
  it("aggregates portfolio current value and accrued return", () => {
    const asOfDate = new Date("2026-01-16T12:00:00.000Z")

    expect(getPortfolioEstimatedCurrentValue(investments, asOfDate)).toBe(
      46_680,
    )
    expect(getPortfolioEstimatedAccruedReturn(investments, asOfDate)).toBe(180)
  })

  it("counts active investments", () => {
    expect(
      getActiveInvestmentCount(
        investments,
        new Date("2026-01-16T12:00:00.000Z"),
      ),
    ).toBe(2)
  })

  it("aggregates daily, monthly, and yearly return estimates", () => {
    const asOfDate = new Date("2026-01-16T12:00:00.000Z")

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
})
