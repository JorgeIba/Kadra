import { describe, expect, it } from "vitest"
import {
  fixedInvestment,
  openEndedInvestment,
} from "@/domain/investments/dev/investment-test-fixtures"
import { resolveInvestment } from "@/domain/investments/read-models/resolved-investment"
import {
  getActiveInvestmentCount,
  getPortfolioEstimatedAccruedReturn,
  getPortfolioEstimatedCurrentValue,
  getPortfolioEstimatedDailyReturn,
  getPortfolioEstimatedMonthlyReturn,
  getPortfolioEstimatedYearlyReturn,
} from "@/domain/investments/read-models/portfolio-values"

const investments = [fixedInvestment, openEndedInvestment]
const asOfDate = new Date("2026-01-16T12:00:00.000Z")
const resolvedInvestments = investments.map((investment) =>
  resolveInvestment(investment, asOfDate),
)

describe("portfolio values", () => {
  it("aggregates portfolio current value and accrued return", () => {
    expect(getPortfolioEstimatedCurrentValue(resolvedInvestments)).toBeCloseTo(
      46_680.042036,
    )
    expect(getPortfolioEstimatedAccruedReturn(resolvedInvestments)).toBeCloseTo(
      180.042036,
    )
  })

  it("counts active investments", () => {
    expect(getActiveInvestmentCount(resolvedInvestments)).toBe(2)
  })

  it("aggregates daily, monthly, and yearly return estimates", () => {
    expect(getPortfolioEstimatedDailyReturn(resolvedInvestments)).toBeCloseTo(
      12.006,
    )
    expect(getPortfolioEstimatedMonthlyReturn(resolvedInvestments)).toBeCloseTo(
      360.18,
    )
    expect(getPortfolioEstimatedYearlyReturn(resolvedInvestments)).toBeCloseTo(
      4_382.19,
    )
  })
})
