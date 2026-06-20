import { describe, expect, it } from "vitest"
import { INVESTMENT_TYPES } from "@/domain/investments/constants"
import { getInvestmentBalanceTimeline } from "@/domain/investments/investment-balance-timeline"
import {
  getInvestmentAccruedReturnAtDate,
  getInvestmentBalanceState,
  getInvestmentEstimatedCurrentValueAtDate,
} from "@/domain/investments/investment-state"
import {
  fixedInvestment,
  openEndedInvestment,
} from "@/domain/investments/investment-test-fixtures"

describe("investment state", () => {
  it("exposes calendar-date state boundaries instead of duplicate Date objects", () => {
    const state = getInvestmentBalanceState(
      fixedInvestment,
      new Date("2026-02-15T12:00:00.000Z"),
    )

    expect(state.requestedDate).toBe("2026-02-15")
    expect(state.timelineEndDate).toBe("2026-01-31")
  })

  it("calculates accrued return from the balance timeline", () => {
    const asOfDate = new Date("2026-01-16T12:00:00.000Z")
    const balanceTimeline = getInvestmentBalanceTimeline(
      fixedInvestment,
      asOfDate,
    )
    const expectedAccruedReturn = balanceTimeline.reduce((total, segment) => {
      return total + segment.interestEarned
    }, 0)

    expect(getInvestmentAccruedReturnAtDate(fixedInvestment, asOfDate)).toBe(
      expectedAccruedReturn,
    )
  })

  it("calculates estimated current value from contributions and accrued return", () => {
    const asOfDate = new Date("2026-01-16T12:00:00.000Z")
    const state = getInvestmentBalanceState(fixedInvestment, asOfDate)

    expect(
      getInvestmentEstimatedCurrentValueAtDate(fixedInvestment, asOfDate),
    ).toBe(state.totalContributedAmount + state.estimatedAccruedReturn)
  })

  it("uses the final active timeline boundary after a fixed-term investment matures", () => {
    const state = getInvestmentBalanceState(
      fixedInvestment,
      new Date("2026-02-15T12:00:00.000Z"),
    )

    expect(state.timelineEndDate).toBe("2026-01-31")
    expect(state.estimatedCurrentValue).toBe(36_800)
    expect(state.currentLifecyclePeriod?.type).toBe(INVESTMENT_TYPES.fixedTerm)
  })

  it("returns a current balance state when no time has elapsed yet", () => {
    const state = getInvestmentBalanceState(
      openEndedInvestment,
      new Date("2026-01-01T12:00:00.000Z"),
    )

    expect(state.currentBalanceSegment).not.toBeNull()
    expect(state.currentBalanceSegment?.interestEarned).toBe(0)
    expect(state.estimatedAccruedReturn).toBe(0)
    expect(state.estimatedCurrentValue).toBe(10_000)
  })
})
