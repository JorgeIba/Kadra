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
  ASSET_SORT_OPTIONS,
  getSortedInvestments,
} from "@/app/screens/assets/assets-sorting"

describe("asset sorting", () => {
  it("sorts investments by newest creation date first", () => {
    expect(
      getSortedInvestments(resolvedInvestments, ASSET_SORT_OPTIONS.newest).map(
        (investment) => investment.id,
      ),
    ).toEqual(["newest", "middle", "oldest", "open-ended-newer", "open-ended"])
  })

  it("sorts investments by highest original amount first", () => {
    expect(
      getSortedInvestments(
        resolvedInvestments,
        ASSET_SORT_OPTIONS.highestAmount,
      ).map((investment) => investment.id),
    ).toEqual(["open-ended", "middle", "oldest", "open-ended-newer", "newest"])
  })

  it("sorts investments by highest annual rate first", () => {
    expect(
      getSortedInvestments(
        resolvedInvestments,
        ASSET_SORT_OPTIONS.highestRate,
      ).map((investment) => investment.id),
    ).toEqual(["open-ended-newer", "newest", "middle", "oldest", "open-ended"])
  })

  it("sorts fixed-term investments by soonest end date and leaves open-ended last", () => {
    expect(
      getSortedInvestments(
        resolvedInvestments,
        ASSET_SORT_OPTIONS.endDateSoonest,
      ).map((investment) => investment.id),
    ).toEqual(["middle", "oldest", "newest", "open-ended", "open-ended-newer"])
  })

  it("does not mutate the original investment list", () => {
    const originalOrder = resolvedInvestments.map((investment) => investment.id)

    getSortedInvestments(resolvedInvestments, ASSET_SORT_OPTIONS.highestAmount)

    expect(resolvedInvestments.map((investment) => investment.id)).toEqual(
      originalOrder,
    )
  })
})

const asOfDate = new Date("2026-06-05T12:00:00.000Z")

const investments: Investment[] = [
  buildFixedTermInvestment({
    annualRate: 8,
    createdAt: "2026-01-01T12:00:00.000Z",
    endDate: "2026-08-01",
    id: "oldest",
    originalAmount: 30_000,
  }),
  buildFixedTermInvestment({
    annualRate: 12,
    createdAt: "2026-02-01T12:00:00.000Z",
    endDate: "2026-07-01",
    id: "middle",
    originalAmount: 40_000,
  }),
  buildFixedTermInvestment({
    annualRate: 14,
    createdAt: "2026-03-01T12:00:00.000Z",
    endDate: "2026-09-01",
    id: "newest",
    originalAmount: 20_000,
  }),
  buildOpenEndedInvestment({
    annualRate: 7,
    createdAt: "2025-12-01T12:00:00.000Z",
    id: "open-ended",
    originalAmount: 50_000,
  }),
  buildOpenEndedInvestment({
    annualRate: 15,
    createdAt: "2025-12-15T12:00:00.000Z",
    id: "open-ended-newer",
    originalAmount: 25_000,
  }),
]
const resolvedInvestments = investments.map((investment) =>
  resolveInvestment(investment, asOfDate),
)

function buildFixedTermInvestment({
  annualRate,
  createdAt,
  endDate,
  id,
  originalAmount,
}: {
  annualRate: number
  createdAt: string
  endDate: string
  id: string
  originalAmount: number
}): Investment {
  return {
    createdAt,
    currency: CURRENCIES.mxn,
    id,
    institutionName: "CETES",
    name: id,
    updatedAt: createdAt,
    contributions: [
      {
        id: `${id}-contribution-1`,
        amount: originalAmount,
        contributionDate: "2026-01-01",
        createdAt,
      },
    ],
    ratePeriods: [
      {
        id: `${id}-rate-period-1`,
        annualRate,
        startDate: "2026-01-01",
        createdAt,
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
        createdAt,
      },
    ],
  }
}

function buildOpenEndedInvestment({
  annualRate,
  createdAt,
  id,
  originalAmount,
}: {
  annualRate: number
  createdAt: string
  id: string
  originalAmount: number
}): Investment {
  return {
    createdAt,
    currency: CURRENCIES.mxn,
    id,
    institutionName: "Klar",
    name: id,
    updatedAt: createdAt,
    contributions: [
      {
        id: `${id}-contribution-1`,
        amount: originalAmount,
        contributionDate: "2025-12-01",
        createdAt,
      },
    ],
    ratePeriods: [
      {
        id: `${id}-rate-period-1`,
        annualRate,
        startDate: "2025-12-01",
        createdAt,
      },
    ],
    lifecyclePeriods: [
      {
        id: `${id}-lifecycle-period-1`,
        type: INVESTMENT_TYPES.openEnded,
        paymentFrequency: PAYMENT_FREQUENCIES.daily,
        reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
        startDate: "2025-12-01",
        createdAt,
      },
    ],
  }
}
