import { describe, expect, it } from "vitest"
import {
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
  resolveInvestment,
} from "@/domain/investments"
import { evolvingInvestment } from "@/domain/investments/dev/investment-test-fixtures"
import {
  buildInvestmentWithRecordedChangeFromFormValues,
  getLatestInvestmentEventDate,
  mapInvestmentToRecordChangeFormValues,
} from "@/app/screens/record-change/adapters/record-change-adapter"
import type { RecordChangeFormValues } from "@/app/screens/record-change/record-change-form-schema"

const asOfDate = new Date("2026-06-15T15:30:00.000Z")

describe("record change adapter", () => {
  it("prefills values from the latest stored facts at the effective date", () => {
    expect(
      mapInvestmentToRecordChangeFormValues(evolvingInvestment, {
        effectiveDate: "2026-02-15",
      }),
    ).toEqual({
      effectiveDate: "2026-02-15",
      hasContribution: false,
      annualRate: 10,
      investmentType: INVESTMENT_TYPES.openEnded,
      paymentFrequency: PAYMENT_FREQUENCIES.monthly,
      reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
    })

    expect(
      mapInvestmentToRecordChangeFormValues(evolvingInvestment, {
        effectiveDate: "2026-03-15",
      }).annualRate,
    ).toBe(12)
  })

  it("appends only a contribution event when terms are unchanged", () => {
    const updatedInvestment = buildInvestmentWithRecordedChangeFromFormValues(
      {
        ...baseRecordValues,
        hasContribution: true,
        contributionAmount: 2_500,
      },
      evolvingInvestment,
      { asOfDate },
    )

    expect(updatedInvestment.updatedAt).toBe(asOfDate.toISOString())
    expect(updatedInvestment.contributionEvents).toHaveLength(3)
    expect(updatedInvestment.rateEvents).toBe(evolvingInvestment.rateEvents)
    expect(updatedInvestment.lifecycleEvents).toBe(
      evolvingInvestment.lifecycleEvents,
    )
    expect(updatedInvestment.contributionEvents[2]).toMatchObject({
      id: "investment-3-contribution-event-3",
      amount: 2_500,
      effectiveDate: "2026-06-15",
      createdAt: asOfDate.toISOString(),
    })
  })

  it("appends only a rate event when only the rate changes", () => {
    const updatedInvestment = buildInvestmentWithRecordedChangeFromFormValues(
      {
        ...baseRecordValues,
        annualRate: 13,
      },
      evolvingInvestment,
      { asOfDate },
    )

    expect(updatedInvestment.contributionEvents).toBe(
      evolvingInvestment.contributionEvents,
    )
    expect(updatedInvestment.rateEvents).toHaveLength(3)
    expect(updatedInvestment.lifecycleEvents).toBe(
      evolvingInvestment.lifecycleEvents,
    )
    expect(updatedInvestment.rateEvents[2]).toMatchObject({
      id: "investment-3-rate-event-3",
      annualRate: 13,
      effectiveDate: "2026-06-15",
    })
  })

  it("rejects records before the latest stored event date", () => {
    expect(getLatestInvestmentEventDate(evolvingInvestment)).toBe("2026-03-01")

    expect(() =>
      buildInvestmentWithRecordedChangeFromFormValues(
        {
          ...baseRecordValues,
          effectiveDate: "2026-02-15",
          annualRate: 11,
        },
        evolvingInvestment,
        { asOfDate },
      ),
    ).toThrow(
      "Choose 2026-03-01 or later. Record change can only append to existing history for now.",
    )
  })

  it("rejects future effective dates", () => {
    expect(() =>
      buildInvestmentWithRecordedChangeFromFormValues(
        {
          ...baseRecordValues,
          effectiveDate: "2026-06-16",
          annualRate: 13,
        },
        evolvingInvestment,
        { asOfDate },
      ),
    ).toThrow("Effective date cannot be in the future.")
  })

  it("uses same-day rate records deterministically by created time", () => {
    const updatedInvestment = buildInvestmentWithRecordedChangeFromFormValues(
      {
        ...baseRecordValues,
        effectiveDate: "2026-03-01",
        annualRate: 13,
      },
      evolvingInvestment,
      { asOfDate },
    )

    expect(
      resolveInvestment(updatedInvestment, new Date("2026-03-15T12:00:00.000Z"))
        .annualRate,
    ).toBe(13)
  })

  it("appends only a lifecycle event when only terms change", () => {
    const updatedInvestment = buildInvestmentWithRecordedChangeFromFormValues(
      {
        ...baseRecordValues,
        investmentType: INVESTMENT_TYPES.fixedTerm,
        paymentFrequency: PAYMENT_FREQUENCIES.atMaturity,
        reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
        maturityDate: "2026-12-31",
      },
      evolvingInvestment,
      { asOfDate },
    )

    expect(updatedInvestment.contributionEvents).toBe(
      evolvingInvestment.contributionEvents,
    )
    expect(updatedInvestment.rateEvents).toBe(evolvingInvestment.rateEvents)
    expect(updatedInvestment.lifecycleEvents).toHaveLength(2)
    expect(updatedInvestment.lifecycleEvents[1]).toMatchObject({
      id: "investment-3-lifecycle-event-2",
      type: INVESTMENT_TYPES.fixedTerm,
      paymentFrequency: PAYMENT_FREQUENCIES.atMaturity,
      reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
      effectiveDate: "2026-06-15",
      maturityDate: "2026-12-31",
    })
  })

  it("can append contribution, rate, and lifecycle events together", () => {
    const updatedInvestment = buildInvestmentWithRecordedChangeFromFormValues(
      {
        ...baseRecordValues,
        hasContribution: true,
        contributionAmount: 1_000,
        annualRate: 13,
        investmentType: INVESTMENT_TYPES.fixedTerm,
        paymentFrequency: PAYMENT_FREQUENCIES.atMaturity,
        reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
        maturityDate: "2026-12-31",
      },
      evolvingInvestment,
      { asOfDate },
    )

    expect(updatedInvestment.contributionEvents).toHaveLength(3)
    expect(updatedInvestment.rateEvents).toHaveLength(3)
    expect(updatedInvestment.lifecycleEvents).toHaveLength(2)
  })

  it("rejects no-op submissions", () => {
    expect(() =>
      buildInvestmentWithRecordedChangeFromFormValues(
        baseRecordValues,
        evolvingInvestment,
        { asOfDate },
      ),
    ).toThrow("Record at least one change before saving.")
  })
})

const baseRecordValues = {
  effectiveDate: "2026-06-15",
  hasContribution: false,
  annualRate: 12,
  investmentType: INVESTMENT_TYPES.openEnded,
  paymentFrequency: PAYMENT_FREQUENCIES.monthly,
  reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
} satisfies RecordChangeFormValues
