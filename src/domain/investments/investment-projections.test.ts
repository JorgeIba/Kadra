import { describe, expect, it } from "vitest"
import {
  getPeriodInvestmentProjectedEarningsForDays,
  getUpcomingInvestmentProjectedEarningsForDays,
  getUpcomingInvestmentProjectedEarningsUntilDate,
} from "@/domain/investments/investment-projections"
import {
  fixedInvestment,
  openEndedInvestment,
} from "@/domain/investments/investment-test-fixtures"
import { DAY_COUNTS } from "@/domain/investments/dates"
import type { Investment } from "@/domain/investments/types"

const asOfDate = new Date("2026-01-16T12:00:00.000Z")
const contributedOpenEndedInvestment = {
  ...openEndedInvestment,
  id: "investment-contributed-open",
  name: "Open with extra contribution",
  contributionEvents: [
    {
      id: "contribution-event-1",
      amount: 10_000,
      effectiveDate: "2026-01-01",
      createdAt: "2026-01-01T18:00:00.000Z",
    },
    {
      id: "contribution-event-2",
      amount: 5_000,
      effectiveDate: "2026-01-10",
      createdAt: "2026-01-10T18:00:00.000Z",
    },
  ],
} satisfies Investment

describe("investment projections", () => {
  it("keeps upcoming and period daily estimates aligned for active investments", () => {
    expect(
      getUpcomingInvestmentProjectedEarningsForDays(
        fixedInvestment,
        DAY_COUNTS.day,
        asOfDate,
      ),
    ).toBe(10)

    expect(
      getPeriodInvestmentProjectedEarningsForDays(
        fixedInvestment,
        DAY_COUNTS.day,
        asOfDate,
      ),
    ).toBe(10)
  })

  it("caps upcoming fixed-term earnings at maturity", () => {
    expect(
      getUpcomingInvestmentProjectedEarningsForDays(
        fixedInvestment,
        DAY_COUNTS.month,
        asOfDate,
      ),
    ).toBe(150)
  })

  it("calculates period earnings from the investment lifecycle start", () => {
    expect(
      getPeriodInvestmentProjectedEarningsForDays(
        fixedInvestment,
        DAY_COUNTS.month,
        asOfDate,
      ),
    ).toBe(300)
  })

  it("projects earnings from resolved history instead of only the original contribution", () => {
    expect(
      getPeriodInvestmentProjectedEarningsForDays(
        contributedOpenEndedInvestment,
        DAY_COUNTS.month,
        asOfDate,
      ),
    ).toBeCloseTo(81.21637848684077)

    expect(
      getUpcomingInvestmentProjectedEarningsForDays(
        contributedOpenEndedInvestment,
        DAY_COUNTS.month,
        asOfDate,
      ),
    ).toBeCloseTo(90.47838643770228)
  })

  it("uses the same balance timeline engine for automatic reinvestment projections", () => {
    expect(
      getUpcomingInvestmentProjectedEarningsForDays(
        openEndedInvestment,
        DAY_COUNTS.month,
        asOfDate,
      ),
    ).toBeCloseTo(60.355101)
  })

  it("projects upcoming earnings until a custom target date", () => {
    expect(
      getUpcomingInvestmentProjectedEarningsUntilDate(
        fixedInvestment,
        "2026-01-21",
        asOfDate,
      ),
    ).toBe(50)
  })
})
