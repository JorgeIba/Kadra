import { describe, expect, it } from "vitest"
import { CURRENCIES } from "@/domain/investments/constants"
import {
  deriveRatePeriods,
  getActiveRatePeriodAtDate,
} from "@/domain/investments/rate-periods"
import type { Investment } from "@/domain/investments/types"

const baseInvestment = {
  id: "investment-1",
  name: "Event-based investment",
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
  ],
  rateEvents: [],
  lifecycleEvents: [],
} satisfies Investment

describe("rate periods", () => {
  it("derives an open-ended period from the latest rate event", () => {
    const investment = {
      ...baseInvestment,
      rateEvents: [
        {
          id: "rate-event-1",
          annualRate: 10,
          effectiveDate: "2026-01-01",
          createdAt: "2026-01-01T12:00:00.000Z",
        },
      ],
    } satisfies Investment

    expect(deriveRatePeriods(investment)).toEqual([
      {
        id: "rate-event-1",
        annualRate: 10,
        startDate: "2026-01-01",
        endDate: null,
        createdAt: "2026-01-01T12:00:00.000Z",
      },
    ])
  })

  it("closes the previous derived period when the next rate event starts", () => {
    const investment = {
      ...baseInvestment,
      rateEvents: [
        {
          id: "rate-event-1",
          annualRate: 10,
          effectiveDate: "2026-01-01",
          createdAt: "2026-01-01T12:00:00.000Z",
        },
        {
          id: "rate-event-2",
          annualRate: 12,
          effectiveDate: "2026-03-01",
          createdAt: "2026-03-01T12:00:00.000Z",
        },
      ],
    } satisfies Investment

    expect(deriveRatePeriods(investment)).toEqual([
      expect.objectContaining({
        id: "rate-event-1",
        annualRate: 10,
        startDate: "2026-01-01",
        endDate: "2026-03-01",
      }),
      expect.objectContaining({
        id: "rate-event-2",
        annualRate: 12,
        startDate: "2026-03-01",
        endDate: null,
      }),
    ])
  })

  it("skips same-day zero-length derived periods deterministically", () => {
    const investment = {
      ...baseInvestment,
      rateEvents: [
        {
          id: "rate-event-1",
          annualRate: 10,
          effectiveDate: "2026-01-01",
          createdAt: "2026-01-01T09:00:00.000Z",
        },
        {
          id: "rate-event-2",
          annualRate: 12,
          effectiveDate: "2026-01-01",
          createdAt: "2026-01-01T10:00:00.000Z",
        },
      ],
    } satisfies Investment

    expect(deriveRatePeriods(investment)).toEqual([
      expect.objectContaining({
        id: "rate-event-2",
        annualRate: 12,
        startDate: "2026-01-01",
        endDate: null,
      }),
    ])
    expect(getActiveRatePeriodAtDate(investment, "2026-01-01")?.id).toBe(
      "rate-event-2",
    )
  })
})
