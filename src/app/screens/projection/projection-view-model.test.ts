import { describe, expect, it } from "vitest"
import {
  createPortfolioProjectionComparison,
  getDefaultProjectionTargetDate,
  getPortfolioProjectionSnapshot,
} from "@/app/screens/projection/projection-view-model"
import {
  fixedInvestment,
  openEndedInvestment,
} from "@/domain/investments/dev/investment-test-fixtures"
import { INVESTMENT_TYPES } from "@/domain/investments"

const asOfDate = new Date("2026-01-16T12:00:00.000Z")
const investments = [fixedInvestment, openEndedInvestment]

describe("projection view model", () => {
  it("defaults the target date to one year from the as-of date", () => {
    expect(getDefaultProjectionTargetDate(asOfDate)).toBe("2027-01-16")
  })

  it("projects portfolio earnings and value at the selected target date", () => {
    const snapshot = getPortfolioProjectionSnapshot(
      investments,
      asOfDate,
      "2026-01-21",
    )

    expect(snapshot.currentValue).toBeCloseTo(46_680.042036)
    expect(snapshot.projectedValue).toBeCloseTo(46_740.076091)
    expect(snapshot.projectedEarnings).toBeCloseTo(60.034055)
    expect(snapshot.earningPace.daily).toBeCloseTo(12.010973)
    expect(snapshot.investmentCount).toBe(2)
    expect(snapshot.hasMaturityScenario).toBe(false)
  })

  it("keeps fixed-term investments flat after maturity", () => {
    const snapshot = getPortfolioProjectionSnapshot(
      investments,
      asOfDate,
      "2026-02-15",
      "keep-as-cash",
    )

    expect(snapshot.activeInvestmentCount).toBe(1)
    expect(snapshot.finishedInvestmentCount).toBe(1)
    expect(snapshot.earningPace.daily).toBeLessThan(3)
    expect(snapshot.hasMaturityScenario).toBe(true)
    expect(snapshot.maturedCash).toBeGreaterThan(0)
    expect(snapshot.breakdown[0]).toMatchObject({
      investmentId: fixedInvestment.id,
      type: INVESTMENT_TYPES.fixedTerm,
      projectedEarnings: 150,
    })
    expect(snapshot.breakdown[1]?.type).toBe(INVESTMENT_TYPES.openEnded)
    expect(snapshot.breakdown[1]?.projectedEarnings).toBeCloseTo(60.355101)
  })

  it("builds chart points from today to the target date", () => {
    const snapshot = getPortfolioProjectionSnapshot(
      investments,
      asOfDate,
      "2026-01-21",
    )

    expect(snapshot.points.map((point) => point.label)).toEqual([
      { kind: "today" },
      { kind: "relative", unit: "day", value: 1 },
      { kind: "relative", unit: "day", value: 2 },
      { kind: "relative", unit: "day", value: 3 },
      { kind: "relative", unit: "day", value: 4 },
      { kind: "target" },
    ])
    expect(snapshot.points.at(-1)).toMatchObject({
      date: "2026-01-21",
    })
  })

  it("labels a tomorrow projection clearly", () => {
    const snapshot = getPortfolioProjectionSnapshot(
      investments,
      asOfDate,
      "2026-01-17",
    )

    expect(snapshot.points.map((point) => point.label)).toEqual([
      { kind: "today" },
      { kind: "tomorrow" },
    ])
  })

  it("clamps past target dates to today", () => {
    const snapshot = getPortfolioProjectionSnapshot(
      investments,
      asOfDate,
      "2026-01-15",
    )

    expect(snapshot.targetDate).toBe("2026-01-16")
    expect(snapshot.projectedEarnings).toBe(0)
    expect(snapshot.projectedValue).toBeCloseTo(snapshot.currentValue)
    expect(snapshot.points).toEqual([
      {
        date: "2026-01-16",
        label: { kind: "today" },
        estimatedValue: snapshot.currentValue,
        projectedEarnings: 0,
      },
    ])
  })

  it("uses broader relative labels for longer projections", () => {
    const snapshot = getPortfolioProjectionSnapshot(
      investments,
      asOfDate,
      "2027-01-16",
    )

    expect(snapshot.points.map((point) => point.label)).toEqual([
      { kind: "today" },
      { kind: "relative", unit: "month", value: 2 },
      { kind: "relative", unit: "month", value: 5 },
      { kind: "relative", unit: "month", value: 7 },
      { kind: "relative", unit: "month", value: 10 },
      { kind: "target" },
    ])
  })

  it("propagates selected strategy to the snapshot", () => {
    const snapshot = getPortfolioProjectionSnapshot(
      investments,
      asOfDate,
      "2026-02-15",
      "reinvest",
    )
    expect(snapshot.reinvestmentStrategy).toBe("reinvest")
    expect(snapshot.activeInvestmentCount).toBe(2)
  })

  it("compares the selected maturity strategy with reinvesting", () => {
    const targetDate = "2026-02-15"
    const reinvestedSnapshot = getPortfolioProjectionSnapshot(
      investments,
      asOfDate,
      targetDate,
      "reinvest",
    )
    const cashSnapshot = getPortfolioProjectionSnapshot(
      investments,
      asOfDate,
      targetDate,
      "keep-as-cash",
    )
    const excludedSnapshot = getPortfolioProjectionSnapshot(
      investments,
      asOfDate,
      targetDate,
      "strict",
    )

    expect(reinvestedSnapshot.comparison).toBeNull()
    expect(cashSnapshot.comparison).toMatchObject({
      metric: "projected-portfolio-value",
      selectedStrategy: "keep-as-cash",
      referenceStrategy: "reinvest",
      selectedValue: cashSnapshot.projectedValue,
      referenceValue: reinvestedSnapshot.projectedValue,
      relationToReference: "lower",
    })
    expect(excludedSnapshot.comparison).toMatchObject({
      metric: "projected-portfolio-value",
      selectedStrategy: "strict",
      referenceStrategy: "reinvest",
      selectedValue: excludedSnapshot.projectedValue,
      referenceValue: reinvestedSnapshot.projectedValue,
      relationToReference: "lower",
    })
    expect(cashSnapshot.comparison?.deltaFromReference).toBeCloseTo(
      Math.round(cashSnapshot.projectedValue * 100) / 100 -
        Math.round(reinvestedSnapshot.projectedValue * 100) / 100,
    )
    expect(excludedSnapshot.comparison?.deltaFromReference).toBeCloseTo(
      Math.round(excludedSnapshot.projectedValue * 100) / 100 -
        Math.round(reinvestedSnapshot.projectedValue * 100) / 100,
    )
    expect(
      Math.abs(excludedSnapshot.comparison?.deltaFromReference ?? 0),
    ).toBeGreaterThan(
      Math.abs(cashSnapshot.comparison?.deltaFromReference ?? 0),
    )
  })

  it("keeps the displayed comparison amount aligned with its rounded relation", () => {
    const comparison = createPortfolioProjectionComparison({
      selectedStrategy: "keep-as-cash",
      selectedValue: 100.004,
      referenceStrategy: "reinvest",
      referenceValue: 100.006,
    })

    expect(comparison.relationToReference).toBe("lower")
    expect(comparison.deltaFromReference).toBe(-0.01)
  })

  it("hides maturity scenarios when no active fixed-term investment matures by the target", () => {
    const snapshot = getPortfolioProjectionSnapshot(
      [openEndedInvestment],
      asOfDate,
      "2026-02-15",
    )

    expect(snapshot.hasMaturityScenario).toBe(false)
  })
})
