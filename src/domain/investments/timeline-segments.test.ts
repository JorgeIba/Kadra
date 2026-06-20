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
  getInvestmentTermsTimelineBoundaries,
  getInvestmentTermsTimeline,
} from "@/domain/investments/timeline-segments"
import { getContributionStateAtDate } from "@/domain/investments/contribution-state"
import type { Investment } from "@/domain/investments/types"

const investment = {
  id: "investment-1",
  name: "Klar evolving",
  institutionName: "Klar",
  currency: CURRENCIES.mxn,
  createdAt: "2026-01-01T12:00:00.000Z",
  updatedAt: "2026-01-01T12:00:00.000Z",
  contributionEvents: [
    {
      id: "contribution-event-1",
      amount: 10_000,
      effectiveDate: "2026-01-01",
      createdAt: "2026-01-01T12:00:00.000Z",
    },
    {
      id: "contribution-event-2",
      amount: 5_000,
      effectiveDate: "2026-02-01",
      createdAt: "2026-02-01T12:00:00.000Z",
    },
  ],
  rateEvents: [
    {
      id: "rate-1",
      annualRate: 10,
      effectiveDate: "2026-01-01",
      createdAt: "2026-01-01T12:00:00.000Z",
    },
    {
      id: "rate-2",
      annualRate: 12,
      effectiveDate: "2026-03-01",
      createdAt: "2026-03-01T12:00:00.000Z",
    },
  ],
  lifecycleEvents: [
    {
      id: "lifecycle-1",
      type: INVESTMENT_TYPES.openEnded,
      paymentFrequency: PAYMENT_FREQUENCIES.monthly,
      reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
      effectiveDate: "2026-01-01",
      createdAt: "2026-01-01T12:00:00.000Z",
    },
  ],
} satisfies Investment

describe("investment terms timeline", () => {
  it("builds sorted unique timeline boundaries", () => {
    expect(
      getInvestmentTermsTimelineBoundaries(investment, "2026-03-15"),
    ).toEqual(["2026-01-01", "2026-02-01", "2026-03-01", "2026-03-15"])
  })

  it("includes contribution, rate, lifecycle, maturity, and as-of boundaries", () => {
    const fixedTermInvestment = {
      ...investment,
      contributionEvents: [
        ...investment.contributionEvents,
        {
          id: "contribution-event-3",
          amount: 1_000,
          effectiveDate: "2026-04-01",
          createdAt: "2026-04-01T12:00:00.000Z",
        },
      ],
      rateEvents: [
        ...investment.rateEvents,
        {
          id: "rate-3",
          annualRate: 14,
          effectiveDate: "2026-05-01",
          createdAt: "2026-05-01T12:00:00.000Z",
        },
      ],
      lifecycleEvents: [
        {
          id: "lifecycle-1",
          type: INVESTMENT_TYPES.openEnded,
          paymentFrequency: PAYMENT_FREQUENCIES.monthly,
          reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
          effectiveDate: "2026-01-01",
          createdAt: "2026-01-01T12:00:00.000Z",
        },
        {
          id: "lifecycle-2",
          type: INVESTMENT_TYPES.fixedTerm,
          paymentFrequency: PAYMENT_FREQUENCIES.atMaturity,
          reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
          effectiveDate: "2026-06-01",
          maturityDate: "2026-07-01",
          createdAt: "2026-06-01T12:00:00.000Z",
        },
      ],
    } satisfies Investment

    expect(
      getInvestmentTermsTimelineBoundaries(fixedTermInvestment, "2026-08-01"),
    ).toEqual([
      "2026-01-01",
      "2026-02-01",
      "2026-03-01",
      "2026-04-01",
      "2026-05-01",
      "2026-06-01",
      "2026-07-01",
      "2026-08-01",
    ])
  })

  it("derives total contributed amount from contributions up to a specific date", () => {
    expect(
      getContributionStateAtDate(investment, "2026-01-31")
        .totalContributedAmount,
    ).toBe(10_000)
    expect(
      getContributionStateAtDate(investment, "2026-02-01")
        .totalContributedAmount,
    ).toBe(15_000)
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
      rateEvents: [
        {
          id: "rate-older",
          annualRate: 10,
          effectiveDate: "2026-01-01",
          createdAt: "2026-01-01T12:00:00.000Z",
        },
        {
          id: "rate-newer",
          annualRate: 12,
          effectiveDate: "2026-03-01",
          createdAt: "2026-03-01T12:00:00.000Z",
        },
      ],
      lifecycleEvents: [
        {
          id: "lifecycle-older",
          type: INVESTMENT_TYPES.openEnded,
          paymentFrequency: PAYMENT_FREQUENCIES.monthly,
          reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
          effectiveDate: "2026-01-01",
          createdAt: "2026-01-01T12:00:00.000Z",
        },
        {
          id: "lifecycle-newer",
          type: INVESTMENT_TYPES.fixedTerm,
          paymentFrequency: PAYMENT_FREQUENCIES.atMaturity,
          reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
          effectiveDate: "2026-03-01",
          maturityDate: "2026-06-01",
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
    const segments = getInvestmentTermsTimeline(
      investment,
      new Date("2026-03-15T12:00:00.000Z"),
    )

    expect(segments).toEqual([
      expect.objectContaining({
        startDate: "2026-01-01",
        endDate: "2026-02-01",
        contributionState: { totalContributedAmount: 10_000 },
        ratePeriod: expect.objectContaining({
          annualRate: 10,
        }),
        lifecyclePeriod: expect.objectContaining({
          type: INVESTMENT_TYPES.openEnded,
          paymentFrequency: PAYMENT_FREQUENCIES.monthly,
          reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
        }),
      }),
      expect.objectContaining({
        startDate: "2026-02-01",
        endDate: "2026-03-01",
        contributionState: { totalContributedAmount: 15_000 },
        ratePeriod: expect.objectContaining({
          annualRate: 10,
        }),
        lifecyclePeriod: expect.objectContaining({
          type: INVESTMENT_TYPES.openEnded,
        }),
      }),
      expect.objectContaining({
        startDate: "2026-03-01",
        endDate: "2026-03-15",
        contributionState: { totalContributedAmount: 15_000 },
        ratePeriod: expect.objectContaining({
          annualRate: 12,
        }),
        lifecyclePeriod: expect.objectContaining({
          type: INVESTMENT_TYPES.openEnded,
        }),
      }),
      expect.objectContaining({
        startDate: "2026-03-15",
        endDate: null,
        contributionState: { totalContributedAmount: 15_000 },
        ratePeriod: expect.objectContaining({
          annualRate: 12,
        }),
        lifecyclePeriod: expect.objectContaining({
          type: INVESTMENT_TYPES.openEnded,
        }),
      }),
    ])
  })

  it("builds the current open-ended segment when no time has elapsed yet", () => {
    expect(
      getInvestmentTermsTimeline(
        investment,
        new Date("2026-01-01T12:00:00.000Z"),
      ),
    ).toEqual([
      expect.objectContaining({
        startDate: "2026-01-01",
        endDate: null,
        contributionState: { totalContributedAmount: 10_000 },
        ratePeriod: expect.objectContaining({
          annualRate: 10,
        }),
        lifecyclePeriod: expect.objectContaining({
          type: INVESTMENT_TYPES.openEnded,
          paymentFrequency: PAYMENT_FREQUENCIES.monthly,
          reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
        }),
      }),
    ])
  })
})
