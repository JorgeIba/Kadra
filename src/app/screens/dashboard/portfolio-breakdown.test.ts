import { describe, expect, it } from "vitest"
import {
  CURRENCIES,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
  type Investment,
} from "@/domain/investments"
import { getPortfolioBreakdown } from "@/app/screens/dashboard/portfolio-breakdown"

const asOfDate = new Date("2026-06-05T12:00:00.000Z")

describe("portfolio breakdown", () => {
  it("groups investments by type", () => {
    const breakdown = getPortfolioBreakdown(investments, asOfDate)

    expect(
      breakdown.byType.map(({ count, label }) => {
        return { count, label }
      }),
    ).toEqual([
      { count: 2, label: "Fixed term" },
      { count: 1, label: "Open ended" },
    ])
  })

  it("groups investments by derived status", () => {
    const breakdown = getPortfolioBreakdown(investments, asOfDate)

    expect(
      breakdown.byStatus.map(({ count, label }) => {
        return { count, label }
      }),
    ).toEqual([
      { count: 2, label: "Active" },
      { count: 1, label: "Finished" },
    ])
  })

  it("returns percentages that represent each group share of estimated value", () => {
    const breakdown = getPortfolioBreakdown(investments, asOfDate)
    const typePercentageTotal = breakdown.byType.reduce((total, item) => {
      return total + item.percentage
    }, 0)

    expect(typePercentageTotal).toBeCloseTo(100)
  })

  it("returns zero percentages for an empty portfolio", () => {
    const breakdown = getPortfolioBreakdown([], asOfDate)

    expect([...breakdown.byType, ...breakdown.byStatus]).toEqual(
      expect.arrayContaining([expect.objectContaining({ percentage: 0 })]),
    )
  })
})

const investments: Investment[] = [
  buildFixedTermInvestment({
    endDate: "2026-05-01",
    id: "finished-fixed",
  }),
  buildFixedTermInvestment({
    endDate: "2026-07-01",
    id: "active-fixed",
  }),
  buildOpenEndedInvestment({
    id: "open-ended",
  }),
]

function buildFixedTermInvestment({
  endDate,
  id,
}: {
  endDate: string
  id: string
}): Investment {
  return {
    createdAt: "2026-01-01T12:00:00.000Z",
    currency: CURRENCIES.mxn,
    id,
    institutionName: "CETES",
    name: id,
    updatedAt: "2026-01-01T12:00:00.000Z",
    contributions: [
      {
        id: `${id}-contribution-1`,
        amount: 10_000,
        contributionDate: "2026-01-01",
        createdAt: "2026-01-01T12:00:00.000Z",
      },
    ],
    ratePeriods: [
      {
        id: `${id}-rate-period-1`,
        annualRate: 10,
        startDate: "2026-01-01",
        createdAt: "2026-01-01T12:00:00.000Z",
      },
    ],
    lifecyclePeriods: [
      {
        id: `${id}-lifecycle-period-1`,
        type: INVESTMENT_TYPES.fixedTerm,
        paymentFrequency: PAYMENT_FREQUENCIES.atMaturity,
        reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
        startDate: "2026-01-01",
        endDate,
        createdAt: "2026-01-01T12:00:00.000Z",
      },
    ],
  }
}

function buildOpenEndedInvestment({ id }: { id: string }): Investment {
  return {
    createdAt: "2026-01-01T12:00:00.000Z",
    currency: CURRENCIES.mxn,
    id,
    institutionName: "Klar",
    name: id,
    updatedAt: "2026-01-01T12:00:00.000Z",
    contributions: [
      {
        id: `${id}-contribution-1`,
        amount: 10_000,
        contributionDate: "2026-01-01",
        createdAt: "2026-01-01T12:00:00.000Z",
      },
    ],
    ratePeriods: [
      {
        id: `${id}-rate-period-1`,
        annualRate: 8,
        startDate: "2026-01-01",
        createdAt: "2026-01-01T12:00:00.000Z",
      },
    ],
    lifecyclePeriods: [
      {
        id: `${id}-lifecycle-period-1`,
        type: INVESTMENT_TYPES.openEnded,
        paymentFrequency: PAYMENT_FREQUENCIES.daily,
        reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
        startDate: "2026-01-01",
        createdAt: "2026-01-01T12:00:00.000Z",
      },
    ],
  }
}
