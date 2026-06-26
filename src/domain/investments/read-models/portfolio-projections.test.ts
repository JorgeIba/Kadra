import { describe, expect, it } from "vitest"
import {
  fixedInvestment,
  openEndedInvestment,
} from "@/domain/investments/dev/investment-test-fixtures"
import { projectPortfolioAtDate } from "@/domain/investments/read-models/portfolio-projections"

const baselineDate = new Date("2026-01-16T12:00:00.000Z")
const investments = [fixedInvestment, openEndedInvestment]

describe("portfolio projections", () => {
  it("projects portfolio value and earnings at a target date", () => {
    const projection = projectPortfolioAtDate(
      investments,
      new Date("2026-01-21T12:00:00.000Z"),
      baselineDate,
    )

    expect(projection.baselineDate).toBe("2026-01-16")
    expect(projection.projectionDate).toBe("2026-01-21")
    expect(projection.estimatedValue).toBeCloseTo(46_740.076091)
    expect(projection.projectedEarnings).toBeCloseTo(60.034055)
    expect(projection.earningPace.daily).toBeCloseTo(12.010973)
    expect(projection.earningPace.monthly).toBeCloseTo(360.240457)
    expect(projection.earningPace.yearly).toBeCloseTo(4_382.925555)
    expect(projection.investmentCount).toBe(2)
  })

  it("keeps fixed-term investments flat after maturity", () => {
    const projection = projectPortfolioAtDate(
      investments,
      new Date("2026-02-15T12:00:00.000Z"),
      baselineDate,
    )

    expect(projection.activeInvestmentCount).toBe(1)
    expect(projection.finishedInvestmentCount).toBe(1)
    expect(projection.earningPace.daily).toBeLessThan(3)
    expect(projection.investments[0]).toMatchObject({
      investmentId: fixedInvestment.id,
      projectedEarnings: 150,
    })
    expect(projection.investments[1]?.projectedEarnings).toBeCloseTo(60.355101)
  })
})
