import { describe, expect, it } from "vitest"
import {
  CURRENCIES,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
} from "@/domain/investments/constants"
import {
  getActiveLifecyclePeriodAtDate,
  getActiveRatePeriodAtDate,
  getInvestmentTimelineBoundaries,
  getInvestmentTimelineSegments,
  getTotalContributedAmountAtDate,
} from "@/domain/investments/timeline-segments"
import type { Investment } from "@/domain/investments/types"

const investment = {
  id: "investment-1",
  name: "Klar evolving",
  institutionName: "Klar",
  currency: CURRENCIES.mxn,
  createdAt: "2026-01-01T12:00:00.000Z",
  updatedAt: "2026-01-01T12:00:00.000Z",
  contributions: [
    {
      id: "contribution-1",
      amount: 10_000,
      contributionDate: "2026-01-01",
      createdAt: "2026-01-01T12:00:00.000Z",
    },
    {
      id: "contribution-2",
      amount: 5_000,
      contributionDate: "2026-02-01",
      createdAt: "2026-02-01T12:00:00.000Z",
    },
  ],
  ratePeriods: [
    {
      id: "rate-1",
      annualRate: 10,
      startDate: "2026-01-01",
      endDate: "2026-03-01",
      createdAt: "2026-01-01T12:00:00.000Z",
    },
    {
      id: "rate-2",
      annualRate: 12,
      startDate: "2026-03-01",
      createdAt: "2026-03-01T12:00:00.000Z",
    },
  ],
  lifecyclePeriods: [
    {
      id: "lifecycle-1",
      type: INVESTMENT_TYPES.openEnded,
      paymentFrequency: PAYMENT_FREQUENCIES.monthly,
      reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
      startDate: "2026-01-01",
      createdAt: "2026-01-01T12:00:00.000Z",
    },
  ],
} satisfies Investment

describe("investment timeline segments", () => {
  it("builds sorted unique timeline boundaries", () => {
    expect(getInvestmentTimelineBoundaries(investment, "2026-03-15")).toEqual([
      "2026-01-01",
      "2026-02-01",
      "2026-03-01",
      "2026-03-15",
    ])
  })

  it("derives total contributed amount from contributions up to a specific date", () => {
    expect(getTotalContributedAmountAtDate(investment, "2026-01-31")).toBe(
      10_000,
    )
    expect(getTotalContributedAmountAtDate(investment, "2026-02-01")).toBe(
      15_000,
    )
  })

  it("finds the active rate and lifecycle period at a given date", () => {
    expect(
      getActiveRatePeriodAtDate(investment, "2026-02-15")?.annualRate,
    ).toBe(10)
    expect(
      getActiveRatePeriodAtDate(investment, "2026-03-01")?.annualRate,
    ).toBe(12)
    expect(getActiveLifecyclePeriodAtDate(investment, "2026-02-15")?.type).toBe(
      INVESTMENT_TYPES.openEnded,
    )
  })

  it("defensively prefers the most recent overlapping period when history is malformed", () => {
    const overlappingInvestment = {
      ...investment,
      ratePeriods: [
        {
          id: "rate-older",
          annualRate: 10,
          startDate: "2026-01-01",
          endDate: "2026-04-01",
          createdAt: "2026-01-01T12:00:00.000Z",
        },
        {
          id: "rate-newer",
          annualRate: 12,
          startDate: "2026-03-01",
          createdAt: "2026-03-01T12:00:00.000Z",
        },
      ],
      lifecyclePeriods: [
        {
          id: "lifecycle-older",
          type: INVESTMENT_TYPES.openEnded,
          paymentFrequency: PAYMENT_FREQUENCIES.monthly,
          reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
          startDate: "2026-01-01",
          createdAt: "2026-01-01T12:00:00.000Z",
        },
        {
          id: "lifecycle-newer",
          type: INVESTMENT_TYPES.fixedTerm,
          paymentFrequency: PAYMENT_FREQUENCIES.atMaturity,
          reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
          startDate: "2026-03-01",
          endDate: "2026-06-01",
          createdAt: "2026-03-01T12:00:00.000Z",
        },
      ],
    } satisfies Investment

    expect(
      getActiveRatePeriodAtDate(overlappingInvestment, "2026-03-15")
        ?.annualRate,
    ).toBe(12)
    expect(
      getActiveLifecyclePeriodAtDate(overlappingInvestment, "2026-03-15")?.type,
    ).toBe(INVESTMENT_TYPES.fixedTerm)
  })

  it("builds stable segments where contributed capital and rate stay constant", () => {
    expect(
      getInvestmentTimelineSegments(
        investment,
        new Date("2026-03-15T12:00:00.000Z"),
      ),
    ).toEqual([
      {
        startDate: "2026-01-01",
        endDate: "2026-02-01",
        totalContributedAmount: 10_000,
        annualRate: 10,
        lifecycleType: INVESTMENT_TYPES.openEnded,
        paymentFrequency: PAYMENT_FREQUENCIES.monthly,
        reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
      },
      {
        startDate: "2026-02-01",
        endDate: "2026-03-01",
        totalContributedAmount: 15_000,
        annualRate: 10,
        lifecycleType: INVESTMENT_TYPES.openEnded,
        paymentFrequency: PAYMENT_FREQUENCIES.monthly,
        reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
      },
      {
        startDate: "2026-03-01",
        endDate: "2026-03-15",
        totalContributedAmount: 15_000,
        annualRate: 12,
        lifecycleType: INVESTMENT_TYPES.openEnded,
        paymentFrequency: PAYMENT_FREQUENCIES.monthly,
        reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
      },
      {
        startDate: "2026-03-15",
        endDate: null,
        totalContributedAmount: 15_000,
        annualRate: 12,
        lifecycleType: INVESTMENT_TYPES.openEnded,
        paymentFrequency: PAYMENT_FREQUENCIES.monthly,
        reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
      },
    ])
  })

  it("builds the current open-ended segment when no time has elapsed yet", () => {
    expect(
      getInvestmentTimelineSegments(
        investment,
        new Date("2026-01-01T12:00:00.000Z"),
      ),
    ).toEqual([
      {
        startDate: "2026-01-01",
        endDate: null,
        totalContributedAmount: 10_000,
        annualRate: 10,
        lifecycleType: INVESTMENT_TYPES.openEnded,
        paymentFrequency: PAYMENT_FREQUENCIES.monthly,
        reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
      },
    ])
  })
})
