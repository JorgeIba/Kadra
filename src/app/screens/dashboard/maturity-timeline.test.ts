import { describe, expect, it } from "vitest"
import {
  CURRENCIES,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
  resolveInvestment,
  type Investment,
} from "@/domain/investments"
import { getMaturityTimelineItems } from "@/app/screens/dashboard/maturity-timeline"

const asOfDate = new Date("2026-06-05T12:00:00.000Z")

describe("maturity timeline", () => {
  it("keeps only upcoming fixed-term investments sorted by end date", () => {
    expect(
      getMaturityTimelineItems(resolvedInvestments, asOfDate).map(
        (item) => item.id,
      ),
    ).toEqual(["soonest", "middle", "latest"])
  })

  it("calculates days remaining from the as-of date", () => {
    expect(
      getMaturityTimelineItems(resolvedInvestments, asOfDate)[0],
    ).toMatchObject({
      daysRemaining: 5,
      endDate: "2026-06-10",
      id: "soonest",
    })
  })

  it("limits the dashboard timeline to three items", () => {
    expect(
      getMaturityTimelineItems(resolvedInvestments, asOfDate),
    ).toHaveLength(3)
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
