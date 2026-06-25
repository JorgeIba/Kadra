import { describe, expect, it } from "vitest"
import {
  CURRENCIES,
  DERIVED_STATUSES,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
} from "@/domain/investments/model/constants"
import {
  deriveLifecyclePeriods,
  getDerivedStatus,
  getLatestLifecyclePeriod,
  getTimelineEndDateForInvestment,
} from "@/domain/investments/events/lifecycle-periods"
import {
  fixedInvestment,
  openEndedInvestment,
} from "@/domain/investments/dev/investment-test-fixtures"
import type { Investment } from "@/domain/investments/model/types"

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
  rateEvents: [
    {
      id: "rate-event-1",
      annualRate: 10,
      effectiveDate: "2026-01-01",
      createdAt: "2026-01-01T12:00:00.000Z",
    },
  ],
  lifecycleEvents: [],
} satisfies Investment

describe("lifecycle periods", () => {
  it("derives open-ended to fixed-term to open-ended lifecycle periods", () => {
    const investment = {
      ...baseInvestment,
      lifecycleEvents: [
        buildOpenEndedLifecycleEvent("lifecycle-event-1", "2026-01-01"),
        buildFixedTermLifecycleEvent(
          "lifecycle-event-2",
          "2026-06-01",
          "2026-07-01",
        ),
        buildOpenEndedLifecycleEvent("lifecycle-event-3", "2026-07-01"),
      ],
    } satisfies Investment

    expect(deriveLifecyclePeriods(investment)).toEqual([
      expect.objectContaining({
        id: "lifecycle-event-1",
        type: INVESTMENT_TYPES.openEnded,
        startDate: "2026-01-01",
        endDate: "2026-06-01",
      }),
      expect.objectContaining({
        id: "lifecycle-event-2",
        type: INVESTMENT_TYPES.fixedTerm,
        startDate: "2026-06-01",
        endDate: "2026-07-01",
        maturityDate: "2026-07-01",
      }),
      expect.objectContaining({
        id: "lifecycle-event-3",
        type: INVESTMENT_TYPES.openEnded,
        startDate: "2026-07-01",
        endDate: null,
      }),
    ])
  })

  it("re-expands an open-ended period when later lifecycle events are deleted", () => {
    const investment = {
      ...baseInvestment,
      lifecycleEvents: [
        buildOpenEndedLifecycleEvent("lifecycle-event-1", "2026-01-01"),
      ],
    } satisfies Investment

    expect(deriveLifecyclePeriods(investment)).toEqual([
      expect.objectContaining({
        id: "lifecycle-event-1",
        type: INVESTMENT_TYPES.openEnded,
        startDate: "2026-01-01",
        endDate: null,
      }),
    ])
  })

  it("ends a fixed-term period at maturity when no later lifecycle event exists", () => {
    const investment = {
      ...baseInvestment,
      lifecycleEvents: [
        buildFixedTermLifecycleEvent(
          "lifecycle-event-1",
          "2026-01-01",
          "2026-04-01",
        ),
      ],
    } satisfies Investment

    expect(deriveLifecyclePeriods(investment)).toEqual([
      expect.objectContaining({
        id: "lifecycle-event-1",
        type: INVESTMENT_TYPES.fixedTerm,
        startDate: "2026-01-01",
        endDate: "2026-04-01",
        maturityDate: "2026-04-01",
      }),
    ])
  })

  it("ends a fixed-term period at the next lifecycle event when replaced before maturity", () => {
    const investment = {
      ...baseInvestment,
      lifecycleEvents: [
        buildFixedTermLifecycleEvent(
          "lifecycle-event-1",
          "2026-01-01",
          "2026-04-01",
        ),
        buildOpenEndedLifecycleEvent("lifecycle-event-2", "2026-03-01"),
      ],
    } satisfies Investment

    expect(deriveLifecyclePeriods(investment)).toEqual([
      expect.objectContaining({
        id: "lifecycle-event-1",
        type: INVESTMENT_TYPES.fixedTerm,
        startDate: "2026-01-01",
        endDate: "2026-03-01",
        maturityDate: "2026-04-01",
      }),
      expect.objectContaining({
        id: "lifecycle-event-2",
        type: INVESTMENT_TYPES.openEnded,
        startDate: "2026-03-01",
        endDate: null,
      }),
    ])
  })

  it("keeps fixed-term investments active before the end date and finished on the end date", () => {
    expect(
      getDerivedStatus(fixedInvestment, new Date("2026-01-30T12:00:00.000Z")),
    ).toBe(DERIVED_STATUSES.active)
    expect(
      getDerivedStatus(fixedInvestment, new Date("2026-01-31T12:00:00.000Z")),
    ).toBe(DERIVED_STATUSES.finished)
  })

  it("keeps open-ended investments active while their lifecycle is still open", () => {
    expect(
      getDerivedStatus(
        openEndedInvestment,
        new Date("2027-01-01T12:00:00.000Z"),
      ),
    ).toBe(DERIVED_STATUSES.active)
  })

  it("keeps the fixed-term end boundary for timeline calculations", () => {
    expect(getTimelineEndDateForInvestment(fixedInvestment, "2026-02-15")).toBe(
      "2026-01-31",
    )
  })

  it("finds the latest lifecycle period", () => {
    expect(getLatestLifecyclePeriod(fixedInvestment)?.id).toBe(
      "lifecycle-event-1",
    )
  })
})

function buildOpenEndedLifecycleEvent(
  id: string,
  effectiveDate: string,
): Investment["lifecycleEvents"][number] {
  return {
    id,
    type: INVESTMENT_TYPES.openEnded,
    paymentFrequency: PAYMENT_FREQUENCIES.monthly,
    reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
    effectiveDate,
    createdAt: `${effectiveDate}T12:00:00.000Z`,
  }
}

function buildFixedTermLifecycleEvent(
  id: string,
  effectiveDate: string,
  maturityDate: string,
): Investment["lifecycleEvents"][number] {
  return {
    id,
    type: INVESTMENT_TYPES.fixedTerm,
    paymentFrequency: PAYMENT_FREQUENCIES.atMaturity,
    reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
    effectiveDate,
    maturityDate,
    createdAt: `${effectiveDate}T12:00:00.000Z`,
  }
}
