import { describe, expect, it } from "vitest"
import { fixedInvestment } from "@/domain/investments/investment-test-fixtures"
import {
  getEstimatedAccruedReturn,
  getEstimatedMonthlyReturn,
  getEstimatedPeriodicReturn,
  getEstimatedYearlyReturn,
} from "@/domain/investments/investment-returns"

describe("investment returns", () => {
  it("calculates accrued return from investment interest periods", () => {
    expect(
      getEstimatedAccruedReturn(
        fixedInvestment,
        new Date("2026-01-16T12:00:00.000Z"),
      ),
    ).toBe(150)
  })

  it("calculates current periodic, monthly, and yearly return estimates", () => {
    const asOfDate = new Date("2026-01-16T12:00:00.000Z")

    expect(getEstimatedPeriodicReturn(fixedInvestment, asOfDate)).toBe(300)
    expect(getEstimatedMonthlyReturn(fixedInvestment, asOfDate)).toBe(300)
    expect(getEstimatedYearlyReturn(fixedInvestment, asOfDate)).toBe(3_650)
  })

  it("uses the last fixed-term snapshot after the investment is finished", () => {
    const asOfDate = new Date("2026-02-15T12:00:00.000Z")

    expect(getEstimatedMonthlyReturn(fixedInvestment, asOfDate)).toBe(300)
  })
})
