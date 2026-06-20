import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  CURRENCIES,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
} from "@/domain/investments"
import {
  buildInvestmentFromFormValues,
  getInvestmentFormPreview,
  mapInvestmentToFormValues,
  mapInvestmentFormToInvestment,
  buildUpdatedInvestmentFromFormValues,
} from "@/app/screens/invest/adapters/investment-form-adapter"
import type { InvestmentFormValues } from "@/app/screens/invest/investment-form-schema"

const metadata = {
  id: "investment-1",
  now: "2026-05-19T18:00:00.000Z",
  startDate: "2026-05-19",
}

const asOfDate = new Date(metadata.now)

describe("investment form adapter", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-05-19T12:00:00.000Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("maps a fixed-term form draft to a fixed-term investment", () => {
    const investment = mapInvestmentFormToInvestment(
      {
        ...baseFormValues,
        endDate: "2026-12-31",
        investmentType: INVESTMENT_TYPES.fixedTerm,
      },
      metadata,
    )

    expect(investment).toEqual({
      createdAt: metadata.now,
      currency: CURRENCIES.mxn,
      id: metadata.id,
      institutionName: "CETES Directo",
      name: "CETES 6 months",
      updatedAt: metadata.now,
      contributionEvents: [
        {
          id: `${metadata.id}-contribution-event-1`,
          amount: 10_000,
          effectiveDate: metadata.startDate,
          createdAt: metadata.now,
        },
      ],
      rateEvents: [
        {
          id: `${metadata.id}-rate-event-1`,
          annualRate: 11.25,
          effectiveDate: metadata.startDate,
          createdAt: metadata.now,
        },
      ],
      lifecycleEvents: [
        {
          id: `${metadata.id}-lifecycle-event-1`,
          type: INVESTMENT_TYPES.fixedTerm,
          paymentFrequency: PAYMENT_FREQUENCIES.monthly,
          reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
          effectiveDate: metadata.startDate,
          maturityDate: "2026-12-31",
          createdAt: metadata.now,
        },
      ],
    })
  })

  it("maps an open-ended form draft to an open-ended investment", () => {
    const investment = mapInvestmentFormToInvestment(
      {
        ...baseFormValues,
        investmentType: INVESTMENT_TYPES.openEnded,
      },
      metadata,
    )

    expect(investment.lifecycleEvents[0]?.type).toBe(INVESTMENT_TYPES.openEnded)
  })

  it("keeps non-empty notes", () => {
    const investment = mapInvestmentFormToInvestment(
      {
        ...baseFormValues,
        endDate: "2026-12-31",
        investmentType: INVESTMENT_TYPES.fixedTerm,
        notes: "Renewal expected.",
      },
      metadata,
    )

    expect(investment.notes).toBe("Renewal expected.")
  })

  it("creates an investment using generated timestamp metadata", () => {
    const investment = buildInvestmentFromFormValues(
      {
        ...baseFormValues,
        endDate: "2026-12-31",
        investmentType: INVESTMENT_TYPES.fixedTerm,
      },
      { asOfDate, id: metadata.id },
    )

    expect(investment.createdAt).toBe(metadata.now)
    expect(investment.updatedAt).toBe(metadata.now)
    expect(investment.lifecycleEvents[0]?.effectiveDate).toBe(
      metadata.startDate,
    )
  })

  it("maps an existing investment back to form values", () => {
    const investment = {
      ...mapInvestmentFormToInvestment(
        {
          ...baseFormValues,
          endDate: "2026-12-31",
          investmentType: INVESTMENT_TYPES.fixedTerm,
        },
        metadata,
      ),
      contributionEvents: [
        {
          id: "investment-1-contribution-event-1",
          amount: 10_000,
          effectiveDate: "2026-05-19",
          createdAt: metadata.now,
        },
        {
          id: "investment-1-contribution-event-2",
          amount: 2_000,
          effectiveDate: "2026-06-01",
          createdAt: "2026-06-01T15:30:00.000Z",
        },
      ],
      rateEvents: [
        {
          id: "investment-1-rate-event-1",
          annualRate: 11.25,
          effectiveDate: "2026-05-19",
          createdAt: metadata.now,
        },
        {
          id: "investment-1-rate-event-2",
          annualRate: 12,
          effectiveDate: "2026-06-01",
          createdAt: "2026-06-01T15:30:00.000Z",
        },
      ],
      lifecycleEvents: [
        {
          id: "investment-1-lifecycle-event-1",
          type: INVESTMENT_TYPES.openEnded,
          paymentFrequency: PAYMENT_FREQUENCIES.monthly,
          reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
          effectiveDate: "2026-05-19",
          createdAt: metadata.now,
        },
        {
          id: "investment-1-lifecycle-event-2",
          type: INVESTMENT_TYPES.fixedTerm,
          paymentFrequency: PAYMENT_FREQUENCIES.atMaturity,
          reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
          effectiveDate: "2026-06-01",
          maturityDate: "2026-12-31",
          createdAt: "2026-06-01T15:30:00.000Z",
        },
      ],
    }

    expect(mapInvestmentToFormValues(investment)).toEqual({
      ...baseFormValues,
      annualRate: 12,
      endDate: "2026-12-31",
      investmentType: INVESTMENT_TYPES.fixedTerm,
      contributionAmount: 2_000,
      paymentFrequency: PAYMENT_FREQUENCIES.atMaturity,
      reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
    })
  })

  it("updates the latest history entries while preserving earlier history", () => {
    const existingInvestment = {
      ...mapInvestmentFormToInvestment(
        {
          ...baseFormValues,
          endDate: "2026-12-31",
          investmentType: INVESTMENT_TYPES.fixedTerm,
        },
        metadata,
      ),
      contributionEvents: [
        {
          id: "investment-1-contribution-event-1",
          amount: 10_000,
          effectiveDate: "2026-05-19",
          createdAt: metadata.now,
        },
        {
          id: "investment-1-contribution-event-2",
          amount: 2_000,
          effectiveDate: "2026-06-01",
          createdAt: "2026-06-01T15:30:00.000Z",
        },
      ],
      rateEvents: [
        {
          id: "investment-1-rate-event-1",
          annualRate: 11.25,
          effectiveDate: "2026-05-19",
          createdAt: metadata.now,
        },
        {
          id: "investment-1-rate-event-2",
          annualRate: 12,
          effectiveDate: "2026-06-01",
          createdAt: "2026-06-01T15:30:00.000Z",
        },
      ],
      lifecycleEvents: [
        {
          id: "investment-1-lifecycle-event-1",
          type: INVESTMENT_TYPES.openEnded,
          paymentFrequency: PAYMENT_FREQUENCIES.monthly,
          reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
          effectiveDate: "2026-05-19",
          createdAt: metadata.now,
        },
        {
          id: "investment-1-lifecycle-event-2",
          type: INVESTMENT_TYPES.fixedTerm,
          paymentFrequency: PAYMENT_FREQUENCIES.atMaturity,
          reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
          effectiveDate: "2026-06-01",
          maturityDate: "2026-12-31",
          createdAt: "2026-06-01T15:30:00.000Z",
        },
      ],
    }
    const updatedAt = new Date("2026-06-15T15:30:00.000Z")

    const updatedInvestment = buildUpdatedInvestmentFromFormValues(
      {
        ...baseFormValues,
        annualRate: 12.5,
        contributionAmount: 3_000,
        endDate: "2027-01-31",
        investmentType: INVESTMENT_TYPES.fixedTerm,
        name: "Updated CETES",
        paymentFrequency: PAYMENT_FREQUENCIES.monthly,
        reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
      },
      existingInvestment,
      { asOfDate: updatedAt },
    )

    expect(updatedInvestment).toMatchObject({
      createdAt: metadata.now,
      id: metadata.id,
      name: "Updated CETES",
      updatedAt: updatedAt.toISOString(),
    })
    expect(updatedInvestment.contributionEvents).toHaveLength(2)
    expect(updatedInvestment.contributionEvents[0]).toEqual(
      existingInvestment.contributionEvents[0],
    )
    expect(updatedInvestment.contributionEvents[1]).toMatchObject({
      amount: 3_000,
      effectiveDate: "2026-06-01",
    })
    expect(updatedInvestment.rateEvents).toHaveLength(2)
    expect(updatedInvestment.rateEvents[0]).toEqual(
      existingInvestment.rateEvents[0],
    )
    expect(updatedInvestment.rateEvents[1]).toMatchObject({
      annualRate: 12.5,
      effectiveDate: "2026-06-01",
    })
    expect(updatedInvestment.lifecycleEvents).toHaveLength(2)
    expect(updatedInvestment.lifecycleEvents[0]).toEqual(
      existingInvestment.lifecycleEvents[0],
    )
    expect(updatedInvestment.lifecycleEvents[1]).toMatchObject({
      maturityDate: "2027-01-31",
      paymentFrequency: PAYMENT_FREQUENCIES.monthly,
      reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
      effectiveDate: "2026-06-01",
    })
  })

  it("returns an incomplete preview for invalid form drafts", () => {
    const preview = getInvestmentFormPreview({}, { asOfDate })

    expect(preview).toBeNull()
  })

  it("returns an incomplete preview when the fixed-term draft has no active lifecycle", () => {
    const preview = getInvestmentFormPreview(
      {
        ...baseFormValues,
        endDate: "2026-05-20",
        investmentType: INVESTMENT_TYPES.fixedTerm,
      },
      { asOfDate: new Date("2026-05-22T12:00:00.000Z") },
    )

    expect(preview).toBeNull()
  })

  it("returns an investment preview for valid fixed-term form drafts", () => {
    const preview = getInvestmentFormPreview(
      {
        ...baseFormValues,
        endDate: "2026-12-31",
        investmentType: INVESTMENT_TYPES.fixedTerm,
      },
      { asOfDate },
    )

    expect(preview).toMatchObject({
      id: "investment-preview",
    })
    expect(preview?.lifecycleEvents[0]?.type).toBe(INVESTMENT_TYPES.fixedTerm)
  })
})

const baseFormValues = {
  annualRate: 11.25,
  currency: CURRENCIES.mxn,
  institutionName: "CETES Directo",
  name: "CETES 6 months",
  notes: "",
  contributionAmount: 10_000,
  paymentFrequency: PAYMENT_FREQUENCIES.monthly,
  reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
} satisfies Omit<InvestmentFormValues, "endDate" | "investmentType">
