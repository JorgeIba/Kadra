import { describe, expect, it } from "vitest"
import {
  CURRENCIES,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
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
      getFilteredInvestments(investments, ASSET_FILTER_OPTIONS.all, asOfDate)
        .length,
    ).toBe(investments.length)
  })

  it("filters fixed-term investments", () => {
    expect(
      getFilteredInvestments(
        investments,
        ASSET_FILTER_OPTIONS.fixedTerm,
        asOfDate,
      ).map((investment) => investment.id),
    ).toEqual(["finished-fixed", "active-fixed"])
  })

  it("filters open-ended investments", () => {
    expect(
      getFilteredInvestments(
        investments,
        ASSET_FILTER_OPTIONS.openEnded,
        asOfDate,
      ).map((investment) => investment.id),
    ).toEqual(["open-ended"])
  })

  it("filters active investments", () => {
    expect(
      getFilteredInvestments(
        investments,
        ASSET_FILTER_OPTIONS.active,
        asOfDate,
      ).map((investment) => investment.id),
    ).toEqual(["active-fixed", "open-ended"])
  })

  it("filters finished investments", () => {
    expect(
      getFilteredInvestments(
        investments,
        ASSET_FILTER_OPTIONS.finished,
        asOfDate,
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

function buildFixedTermInvestment({
  endDate,
  id,
}: {
  endDate: string
  id: string
}): Investment {
  return {
    annualRate: 10,
    createdAt: "2026-01-01T12:00:00.000Z",
    currency: CURRENCIES.mxn,
    endDate,
    id,
    institutionName: "CETES",
    name: id,
    originalAmount: 10_000,
    paymentFrequency: PAYMENT_FREQUENCIES.atMaturity,
    reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
    startDate: "2026-01-01",
    type: INVESTMENT_TYPES.fixedTerm,
    updatedAt: "2026-01-01T12:00:00.000Z",
  }
}

function buildOpenEndedInvestment({ id }: { id: string }): Investment {
  return {
    annualRate: 8,
    createdAt: "2026-01-01T12:00:00.000Z",
    currency: CURRENCIES.mxn,
    id,
    institutionName: "Klar",
    name: id,
    originalAmount: 10_000,
    paymentFrequency: PAYMENT_FREQUENCIES.daily,
    reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
    startDate: "2026-01-01",
    type: INVESTMENT_TYPES.openEnded,
    updatedAt: "2026-01-01T12:00:00.000Z",
  }
}
