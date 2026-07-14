import { describe, expect, it } from "vitest"
import {
  getPeriodInvestmentProjectedEarningsForDays,
  getUpcomingInvestmentProjectedEarningsForDays,
  getUpcomingInvestmentProjectedEarningsUntilDate,
  isFixedTermMaturingAfterDate,
  isFixedTermMaturingBetweenDates,
  withSimulatedReinvestment,
} from "@/domain/investments/calculations/investment-projections"
import {
  fixedInvestment,
  openEndedInvestment,
} from "@/domain/investments/dev/investment-test-fixtures"
import { DAY_COUNTS } from "@/domain/investments/calculations/dates"
import { INVESTMENT_TYPES } from "@/domain/investments/model/constants"
import type { Investment } from "@/domain/investments/model/types"

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

describe("isFixedTermMaturingAfterDate", () => {
  const baselineDate = "2026-01-15"

  it("returns true for fixed-term investments maturing in the future", () => {
    const affected: Investment = {
      ...fixedInvestment,
      lifecycleEvents: [
        {
          ...fixedInvestment.lifecycleEvents[0],
          type: INVESTMENT_TYPES.fixedTerm,
          effectiveDate: "2026-01-01",
          maturityDate: "2026-02-01",
        },
      ],
    }
    expect(isFixedTermMaturingAfterDate(affected, baselineDate)).toBe(true)
  })

  it("returns false for fixed-term investments matured in the past", () => {
    const matured: Investment = {
      ...fixedInvestment,
      lifecycleEvents: [
        {
          ...fixedInvestment.lifecycleEvents[0],
          type: INVESTMENT_TYPES.fixedTerm,
          effectiveDate: "2026-01-01",
          maturityDate: "2026-01-10",
        },
      ],
    }
    expect(isFixedTermMaturingAfterDate(matured, baselineDate)).toBe(false)
  })

  it("returns false for open-ended investments", () => {
    expect(
      isFixedTermMaturingAfterDate(openEndedInvestment, baselineDate),
    ).toBe(false)
  })
})

describe("isFixedTermMaturingBetweenDates", () => {
  it("returns true if matured during window", () => {
    const CD: Investment = {
      ...fixedInvestment,
      lifecycleEvents: [
        {
          ...fixedInvestment.lifecycleEvents[0],
          type: INVESTMENT_TYPES.fixedTerm,
          effectiveDate: "2026-01-01",
          maturityDate: "2026-01-20",
        },
      ],
    }
    expect(
      isFixedTermMaturingBetweenDates(CD, "2026-01-15", "2026-01-25"),
    ).toBe(true)
  })

  it("returns false if matured before window starts", () => {
    const CD: Investment = {
      ...fixedInvestment,
      lifecycleEvents: [
        {
          ...fixedInvestment.lifecycleEvents[0],
          type: INVESTMENT_TYPES.fixedTerm,
          effectiveDate: "2026-01-01",
          maturityDate: "2026-01-10",
        },
      ],
    }
    expect(
      isFixedTermMaturingBetweenDates(CD, "2026-01-15", "2026-01-25"),
    ).toBe(false)
  })

  it("returns false if matured after window ends", () => {
    const CD: Investment = {
      ...fixedInvestment,
      lifecycleEvents: [
        {
          ...fixedInvestment.lifecycleEvents[0],
          type: INVESTMENT_TYPES.fixedTerm,
          effectiveDate: "2026-01-01",
          maturityDate: "2026-01-30",
        },
      ],
    }
    expect(
      isFixedTermMaturingBetweenDates(CD, "2026-01-15", "2026-01-25"),
    ).toBe(false)
  })
})

describe("withSimulatedReinvestment", () => {
  const baseline = new Date("2026-01-15T12:00:00.000Z")

  it("returns the original investment if it matured in the past", () => {
    const matured: Investment = {
      ...fixedInvestment,
      lifecycleEvents: [
        {
          ...fixedInvestment.lifecycleEvents[0],
          type: INVESTMENT_TYPES.fixedTerm,
          effectiveDate: "2026-01-01",
          maturityDate: "2026-01-10",
        },
      ],
    }
    const projected = withSimulatedReinvestment(
      matured,
      new Date("2026-02-01T12:00:00.000Z"),
      baseline,
    )
    expect(projected.lifecycleEvents.length).toBe(1)
  })

  it("transitions the investment to open-ended starting on the maturity date if it matures after baseline", () => {
    const active: Investment = {
      ...fixedInvestment,
      lifecycleEvents: [
        {
          ...fixedInvestment.lifecycleEvents[0],
          type: INVESTMENT_TYPES.fixedTerm,
          effectiveDate: "2026-01-01",
          maturityDate: "2026-01-30",
        },
      ],
    }
    const projected = withSimulatedReinvestment(
      active,
      new Date("2026-02-15T12:00:00.000Z"),
      baseline,
    )
    expect(projected.lifecycleEvents.length).toBe(2)
    expect(projected.lifecycleEvents[1].type).toBe("open-ended")
    expect(projected.lifecycleEvents[1].effectiveDate).toBe("2026-01-30")
    expect(projected.lifecycleEvents[1].paymentFrequency).toBe("monthly")
  })

  it("falls back to daily compounding for at-maturity payment frequency in reinvestment", () => {
    const active: Investment = {
      ...fixedInvestment,
      lifecycleEvents: [
        {
          ...fixedInvestment.lifecycleEvents[0],
          type: INVESTMENT_TYPES.fixedTerm,
          effectiveDate: "2026-01-01",
          maturityDate: "2026-01-30",
          paymentFrequency: "at-maturity",
        },
      ],
    }
    const projected = withSimulatedReinvestment(
      active,
      new Date("2026-02-15T12:00:00.000Z"),
      baseline,
    )
    expect(projected.lifecycleEvents.length).toBe(2)
    expect(projected.lifecycleEvents[1].paymentFrequency).toBe("daily")
  })

  it("handles exact maturity date boundaries correctly (no premature or late reinvestment)", () => {
    const active: Investment = {
      ...fixedInvestment,
      lifecycleEvents: [
        {
          ...fixedInvestment.lifecycleEvents[0],
          type: INVESTMENT_TYPES.fixedTerm,
          effectiveDate: "2026-01-01",
          maturityDate: "2026-01-30",
        },
      ],
    }
    // Exactly on maturity date: should simulate reinvestment
    const projectedExact = withSimulatedReinvestment(
      active,
      new Date("2026-01-30T12:00:00.000Z"),
      baseline,
    )
    expect(projectedExact.lifecycleEvents.length).toBe(2)

    // Strictly before maturity date: should NOT simulate reinvestment
    const projectedBefore = withSimulatedReinvestment(
      active,
      new Date("2026-01-29T12:00:00.000Z"),
      baseline,
    )
    expect(projectedBefore.lifecycleEvents.length).toBe(1)
  })
})
