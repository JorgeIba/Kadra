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
  it("groups active capital by investment type", () => {
    const breakdown = getPortfolioBreakdown(resolvedInvestments)

    expect(
      breakdown.activeCapitalByType.map(({ count, type }) => {
        return { count, type }
      }),
    ).toEqual([
      { count: 1, type: INVESTMENT_TYPES.fixedTerm },
      { count: 1, type: INVESTMENT_TYPES.openEnded },
    ])
  })

  it("excludes finished investments from active capital groups", () => {
    const breakdown = getPortfolioBreakdown(resolvedInvestments)

    expect(
      breakdown.activeCapitalByType.some((item) => {
        return item.count === 0 || item.estimatedValue === 0
      }),
    ).toBe(false)
  })

  it("returns percentages that represent each group share of active value", () => {
    const breakdown = getPortfolioBreakdown(resolvedInvestments)

    expect(breakdown.activeCapitalByType).toEqual([
      expect.objectContaining({
        count: 1,
        estimatedValue: expect.closeTo(10_424.657534),
        type: INVESTMENT_TYPES.fixedTerm,
        percentage: expect.closeTo(50.190497664767406),
      }),
      expect.objectContaining({
        count: 1,
        estimatedValue: expect.closeTo(10_345.524112),
        type: INVESTMENT_TYPES.openEnded,
        percentage: expect.closeTo(49.809502335232594),
      }),
    ])
  })

  it("returns no active capital groups for an empty portfolio", () => {
    const breakdown = getPortfolioBreakdown([])

    expect(breakdown.activeCapitalByType).toEqual([])
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
