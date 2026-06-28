import { describe, expect, it } from "vitest"
import {
  CURRENCIES,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
  resolveInvestment,
  type Investment,
} from "@/domain/investments"
import { getPortfolioBreakdown } from "@/app/screens/dashboard/portfolio-breakdown"

const asOfDate = new Date("2026-06-05T12:00:00.000Z")

describe("portfolio breakdown", () => {
  it("groups investments by type", () => {
    const breakdown = getPortfolioBreakdown(resolvedInvestments)

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
    const breakdown = getPortfolioBreakdown(resolvedInvestments)

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
    const breakdown = getPortfolioBreakdown(resolvedInvestments)

    expect(breakdown.byType).toEqual([
      expect.objectContaining({
        count: 2,
        estimatedValue: expect.closeTo(10_424.657534),
        label: "Fixed term",
        percentage: expect.closeTo(50.190497664767406),
      }),
      expect.objectContaining({
        count: 1,
        estimatedValue: expect.closeTo(10_345.524112),
        label: "Open ended",
        percentage: expect.closeTo(49.809502335232594),
      }),
    ])
    expect(breakdown.byStatus).toEqual([
      expect.objectContaining({
        count: 2,
        estimatedValue: expect.closeTo(20_770.181646),
        label: "Active",
        percentage: expect.closeTo(100),
      }),
      expect.objectContaining({
        count: 1,
        estimatedValue: 0,
        label: "Finished",
        percentage: 0,
      }),
    ])
  })

  it("returns zero percentages for an empty portfolio", () => {
    const breakdown = getPortfolioBreakdown([])

    expect([...breakdown.byType, ...breakdown.byStatus]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ percentage: 0 }),
        expect.objectContaining({ percentage: 0 }),
        expect.objectContaining({ percentage: 0 }),
        expect.objectContaining({ percentage: 0 }),
      ]),
    )
    expect(
      [...breakdown.byType, ...breakdown.byStatus].every((item) => {
        return item.percentage === 0
      }),
    ).toBe(true)
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
const resolvedInvestments = investments.map((investment) =>
  resolveInvestment(investment, asOfDate),
)

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
    contributionEvents: [
      {
        id: `${id}-contribution-event-1`,
        amount: 10_000,
        effectiveDate: "2026-01-01",
        createdAt: "2026-01-01T12:00:00.000Z",
      },
    ],
    rateEvents: [
      {
        id: `${id}-rate-event-1`,
        annualRate: 10,
        effectiveDate: "2026-01-01",
        createdAt: "2026-01-01T12:00:00.000Z",
      },
    ],
    lifecycleEvents: [
      {
        id: `${id}-lifecycle-event-1`,
        type: INVESTMENT_TYPES.fixedTerm,
        paymentFrequency: PAYMENT_FREQUENCIES.atMaturity,
        reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
        effectiveDate: "2026-01-01",
        maturityDate: endDate,
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
    contributionEvents: [
      {
        id: `${id}-contribution-event-1`,
        amount: 10_000,
        effectiveDate: "2026-01-01",
        createdAt: "2026-01-01T12:00:00.000Z",
      },
    ],
    rateEvents: [
      {
        id: `${id}-rate-event-1`,
        annualRate: 8,
        effectiveDate: "2026-01-01",
        createdAt: "2026-01-01T12:00:00.000Z",
      },
    ],
    lifecycleEvents: [
      {
        id: `${id}-lifecycle-event-1`,
        type: INVESTMENT_TYPES.openEnded,
        paymentFrequency: PAYMENT_FREQUENCIES.daily,
        reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
        effectiveDate: "2026-01-01",
        createdAt: "2026-01-01T12:00:00.000Z",
      },
    ],
  }
}
