import { describe, expect, it } from "vitest"
import {
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
      "Today",
      "1d",
      "2d",
      "3d",
      "4d",
      "Target",
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
      "Today",
      "Tomorrow",
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
        label: "Today",
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
      "Today",
      "2mo",
      "5mo",
      "7mo",
      "10mo",
      "Target",
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
})
