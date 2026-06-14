import { describe, expect, it } from "vitest"
import {
  evolvingInvestment,
  fixedInvestment,
} from "@/domain/investments/investment-test-fixtures"
import {
  getCurrentBalanceTimelineSegment,
  getInvestmentBalanceTimeline,
} from "@/domain/investments/investment-balance-timeline"

describe("investment balance timeline", () => {
  it("carries forward reinvested earnings into the next segment", () => {
    const balanceTimeline = getInvestmentBalanceTimeline(
      evolvingInvestment,
      new Date("2026-03-15T12:00:00.000Z"),
    )

    expect(balanceTimeline).toHaveLength(3)

    expect(balanceTimeline[0]).toMatchObject({
      totalContributedAmount: 10_000,
      startingBalance: 10_000,
    })
    expect(balanceTimeline[0].interestEarned).toBeCloseTo(84.93150684931507)
    expect(balanceTimeline[0].endingBalance).toBeCloseTo(10_084.931507)

    expect(balanceTimeline[1]).toMatchObject({
      totalContributedAmount: 15_000,
    })
    expect(balanceTimeline[1].startingBalance).toBeCloseTo(15_084.931507)
    expect(balanceTimeline[1].interestEarned).toBeCloseTo(115.72002251829613)
    expect(balanceTimeline[1].endingBalance).toBeCloseTo(15_200.651529367611)

    expect(balanceTimeline[2].startingBalance).toBeCloseTo(15_200.651529)
    expect(balanceTimeline[2].interestEarned).toBeCloseTo(69.96464265571942)
    expect(balanceTimeline[2].endingBalance).toBeCloseTo(15_270.616172)
  })

  it("does not add earned interest back into principal when reinvestment is to cash", () => {
    const currentBalanceSegment = getCurrentBalanceTimelineSegment(
      fixedInvestment,
      new Date("2026-01-16T12:00:00.000Z"),
    )

    if (currentBalanceSegment === null) {
      throw new Error("Expected a current balance segment")
    }

    expect(currentBalanceSegment.startingBalance).toBe(36_500)
    expect(currentBalanceSegment.endingBalance).toBe(36_500)
  })
})
