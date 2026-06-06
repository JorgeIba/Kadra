import { describe, expect, it } from "vitest"
import {
  CURRENCIES,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
  type Investment,
} from "@/domain/investments"
import { getMaturityTimelineItems } from "@/app/screens/dashboard/maturity-timeline"

const asOfDate = new Date("2026-06-05T12:00:00.000Z")

describe("maturity timeline", () => {
  it("keeps only upcoming fixed-term investments sorted by end date", () => {
    expect(
      getMaturityTimelineItems(investments, asOfDate).map((item) => item.id),
    ).toEqual(["soonest", "middle", "latest"])
  })

  it("calculates days remaining from the as-of date", () => {
    expect(getMaturityTimelineItems(investments, asOfDate)[0]).toMatchObject({
      daysRemaining: 5,
      endDate: "2026-06-10",
      id: "soonest",
    })
  })

  it("limits the dashboard timeline to three items", () => {
    expect(getMaturityTimelineItems(investments, asOfDate)).toHaveLength(3)
  })
})

const investments: Investment[] = [
  buildFixedTermInvestment({
    endDate: "2026-06-10",
    id: "soonest",
  }),
  buildFixedTermInvestment({
    endDate: "2026-07-01",
    id: "middle",
  }),
  buildFixedTermInvestment({
    endDate: "2026-08-01",
    id: "latest",
  }),
  buildFixedTermInvestment({
    endDate: "2026-09-01",
    id: "beyond-limit",
  }),
  buildFixedTermInvestment({
    endDate: "2026-05-01",
    id: "finished",
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
