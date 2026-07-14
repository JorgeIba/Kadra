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

  it("ensures baseline stability is unaffected by the strategy toggles", () => {
    const projCash = projectPortfolioAtDate(
      investments,
      baselineDate,
      baselineDate,
      "keep-as-cash",
    )
    const projReinvest = projectPortfolioAtDate(
      investments,
      baselineDate,
      baselineDate,
      "reinvest",
    )
    const projStrict = projectPortfolioAtDate(
      investments,
      baselineDate,
      baselineDate,
      "strict",
    )

    expect(projCash.estimatedValue).toBe(projReinvest.estimatedValue)
    expect(projCash.estimatedValue).toBe(projStrict.estimatedValue)
    expect(projCash.projectedEarnings).toBe(0)
    expect(projReinvest.projectedEarnings).toBe(0)
    expect(projStrict.projectedEarnings).toBe(0)
  })

  it("applies keep-as-cash strategy (retains value, drops active count and earning pace)", () => {
    const projection = projectPortfolioAtDate(
      investments,
      new Date("2026-02-15T12:00:00.000Z"),
      baselineDate,
      "keep-as-cash",
    )

    // CD matures on 2026-01-31. It has matured by Feb 15.
    // Value remains in portfolio as cash: active value (open ended) + cash (fixed matured value).
    // Earning pace drops (CD is not active).
    expect(projection.activeInvestmentCount).toBe(1)
    expect(projection.finishedInvestmentCount).toBe(1)

    // Total value = active open-ended + matured CD value ($36,650)
    // Earning pace is only open-ended's daily return (~2)
    expect(projection.earningPace.daily).toBeCloseTo(2.018079, 3)

    // Check that individual breakdown values match the sum
    const sumBreakdown = projection.investments.reduce(
      (sum, inv) => sum + inv.projectedValue,
      0,
    )
    expect(projection.estimatedValue).toBeCloseTo(sumBreakdown, 3)
  })

  it("applies reinvest strategy (value grows, active count remains high, earning pace remains high)", () => {
    const projection = projectPortfolioAtDate(
      investments,
      new Date("2026-02-15T12:00:00.000Z"),
      baselineDate,
      "reinvest",
    )

    // CD is active due to reinvestment.
    expect(projection.activeInvestmentCount).toBe(2)
    expect(projection.finishedInvestmentCount).toBe(0)

    // Earning pace is high (~12 daily return) because CD is still earning interest
    expect(projection.earningPace.daily).toBeCloseTo(12.018079, 3)

    const sumBreakdown = projection.investments.reduce(
      (sum, inv) => sum + inv.projectedValue,
      0,
    )
    expect(projection.estimatedValue).toBeCloseTo(sumBreakdown, 3)
  })

  it("applies strict strategy (value drops, active count drops, individual projected value is 0)", () => {
    const projection = projectPortfolioAtDate(
      investments,
      new Date("2026-02-15T12:00:00.000Z"),
      baselineDate,
      "strict",
    )

    // CD matured and is removed.
    expect(projection.activeInvestmentCount).toBe(1)
    expect(projection.finishedInvestmentCount).toBe(1)

    // Earning pace drops
    expect(projection.earningPace.daily).toBeCloseTo(2.018079, 3)

    // CD projectedValue should be 0
    const cdBreakdown = projection.investments.find(
      (inv) => inv.investmentId === fixedInvestment.id,
    )
    expect(cdBreakdown?.projectedValue).toBe(0)

    // Total value = only active open-ended (sum of breakdown match total value)
    const sumBreakdown = projection.investments.reduce(
      (sum, inv) => sum + inv.projectedValue,
      0,
    )
    expect(projection.estimatedValue).toBeCloseTo(sumBreakdown, 3)
  })
})
