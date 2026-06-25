import { describe, expect, it } from "vitest"
import {
  evolvingInvestment,
  fixedInvestment,
} from "@/domain/investments/dev/investment-test-fixtures"
import {
  getCurrentBalanceTimelineSegment,
  getInvestmentBalanceTimeline,
} from "@/domain/investments/calculations/investment-balance-timeline"

describe("investment balance timeline", () => {
  it("carries forward reinvested earnings into the next segment", () => {
    const balanceTimeline = getInvestmentBalanceTimeline(
      evolvingInvestment,
      new Date("2026-03-15T12:00:00.000Z"),
    )

    expect(balanceTimeline).toHaveLength(4)

    expect(balanceTimeline[0]).toMatchObject({
      contributionState: { totalContributedAmount: 10_000 },
      startingBalance: 10_000,
    })
    expect(balanceTimeline[0].interestEarned).toBeCloseTo(84.95402514543093)
    expect(balanceTimeline[0].endingBalance).toBeCloseTo(10_084.954025)

    expect(balanceTimeline[1]).toMatchObject({
      contributionState: { totalContributedAmount: 15_000 },
    })
    expect(balanceTimeline[1].startingBalance).toBeCloseTo(15_084.954025)
    expect(balanceTimeline[1].interestEarned).toBeCloseTo(115.72019526139047)
    expect(balanceTimeline[1].endingBalance).toBeCloseTo(15_200.67422)

    expect(balanceTimeline[2].startingBalance).toBeCloseTo(15_200.67422)
    expect(balanceTimeline[2].interestEarned).toBeCloseTo(69.96474709666654)
    expect(balanceTimeline[2].endingBalance).toBeCloseTo(15_270.638968)

    expect(balanceTimeline[3]).toMatchObject({
      startDate: "2026-03-15",
      endDate: null,
      contributionState: { totalContributedAmount: 15_000 },
      interestEarned: 0,
    })
    expect(balanceTimeline[3].startingBalance).toBeCloseTo(15_270.638968)
    expect(balanceTimeline[3].endingBalance).toBeCloseTo(15_270.638968)
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

  it("returns the current balance state when no time has elapsed yet", () => {
    const currentBalanceSegment = getCurrentBalanceTimelineSegment(
      fixedInvestment,
      new Date("2026-01-01T12:00:00.000Z"),
    )

    if (currentBalanceSegment === null) {
      throw new Error("Expected a current balance segment")
    }

    expect(currentBalanceSegment).toMatchObject({
      startDate: "2026-01-01",
      endDate: null,
      contributionState: { totalContributedAmount: 36_500 },
      startingBalance: 36_500,
      interestEarned: 0,
      endingBalance: 36_500,
    })
  })
})
