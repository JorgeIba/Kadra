import { describe, expect, it } from "vitest"
import {
  CURRENCIES,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
  resolveInvestment,
  type Investment,
} from "@/domain/investments"
import {
  ASSET_FILTER_OPTIONS,
  getFilteredInvestments,
} from "@/app/screens/assets/assets-filtering"

const asOfDate = new Date("2026-06-05T12:00:00.000Z")

describe("asset filtering", () => {
  it("returns every investment for the all filter", () => {
    expect(
      getFilteredInvestments(resolvedInvestments, ASSET_FILTER_OPTIONS.all)
        .length,
    ).toBe(investments.length)
  })

  it("filters fixed-term investments", () => {
    expect(
      getFilteredInvestments(
        resolvedInvestments,
        ASSET_FILTER_OPTIONS.fixedTerm,
      ).map((investment) => investment.id),
    ).toEqual(["finished-fixed", "active-fixed"])
  })

  it("filters open-ended investments", () => {
    expect(
      getFilteredInvestments(
        resolvedInvestments,
        ASSET_FILTER_OPTIONS.openEnded,
      ).map((investment) => investment.id),
    ).toEqual(["open-ended"])
  })

  it("filters active investments", () => {
    expect(
      getFilteredInvestments(
        resolvedInvestments,
        ASSET_FILTER_OPTIONS.active,
      ).map((investment) => investment.id),
    ).toEqual(["active-fixed", "open-ended"])
  })

  it("filters finished investments", () => {
    expect(
      getFilteredInvestments(
        resolvedInvestments,
        ASSET_FILTER_OPTIONS.finished,
      ).map((investment) => investment.id),
    ).toEqual(["finished-fixed"])
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
