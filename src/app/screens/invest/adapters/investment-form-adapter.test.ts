import { describe, expect, it } from "vitest"
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
      contributions: [
        {
          id: `${metadata.id}-contribution-1`,
          amount: 10_000,
          contributionDate: metadata.startDate,
          createdAt: metadata.now,
        },
      ],
      ratePeriods: [
        {
          id: `${metadata.id}-rate-period-1`,
          annualRate: 11.25,
          startDate: metadata.startDate,
          createdAt: metadata.now,
        },
      ],
      lifecyclePeriods: [
        {
          id: `${metadata.id}-lifecycle-period-1`,
          type: INVESTMENT_TYPES.fixedTerm,
          paymentFrequency: PAYMENT_FREQUENCIES.monthly,
          reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
          startDate: metadata.startDate,
          endDate: "2026-12-31",
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

    expect(investment.lifecyclePeriods[0]?.type).toBe(
      INVESTMENT_TYPES.openEnded,
    )
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
    expect(investment.lifecyclePeriods[0]?.startDate).toBe(metadata.startDate)
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
      contributions: [
        {
          id: "investment-1-contribution-1",
          amount: 10_000,
          contributionDate: "2026-05-19",
          createdAt: metadata.now,
        },
        {
          id: "investment-1-contribution-2",
          amount: 2_000,
          contributionDate: "2026-06-01",
          createdAt: "2026-06-01T15:30:00.000Z",
        },
      ],
      ratePeriods: [
        {
          id: "investment-1-rate-period-1",
          annualRate: 11.25,
          startDate: "2026-05-19",
          endDate: "2026-06-01",
          createdAt: metadata.now,
        },
        {
          id: "investment-1-rate-period-2",
          annualRate: 12,
          startDate: "2026-06-01",
          createdAt: "2026-06-01T15:30:00.000Z",
        },
      ],
      lifecyclePeriods: [
        {
          id: "investment-1-lifecycle-period-1",
          type: INVESTMENT_TYPES.openEnded,
          paymentFrequency: PAYMENT_FREQUENCIES.monthly,
          reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
          startDate: "2026-05-19",
          createdAt: metadata.now,
        },
        {
          id: "investment-1-lifecycle-period-2",
          type: INVESTMENT_TYPES.fixedTerm,
          paymentFrequency: PAYMENT_FREQUENCIES.atMaturity,
          reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
          startDate: "2026-06-01",
          endDate: "2026-12-31",
          createdAt: "2026-06-01T15:30:00.000Z",
        },
      ],
    }

    expect(mapInvestmentToFormValues(investment)).toEqual({
      ...baseFormValues,
      annualRate: 12,
      endDate: "2026-12-31",
      investmentType: INVESTMENT_TYPES.fixedTerm,
      originalAmount: 2_000,
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
      contributions: [
        {
          id: "investment-1-contribution-1",
          amount: 10_000,
          contributionDate: "2026-05-19",
          createdAt: metadata.now,
        },
        {
          id: "investment-1-contribution-2",
          amount: 2_000,
          contributionDate: "2026-06-01",
          createdAt: "2026-06-01T15:30:00.000Z",
        },
      ],
      ratePeriods: [
        {
          id: "investment-1-rate-period-1",
          annualRate: 11.25,
          startDate: "2026-05-19",
          endDate: "2026-06-01",
          createdAt: metadata.now,
        },
        {
          id: "investment-1-rate-period-2",
          annualRate: 12,
          startDate: "2026-06-01",
          createdAt: "2026-06-01T15:30:00.000Z",
        },
      ],
      lifecyclePeriods: [
        {
          id: "investment-1-lifecycle-period-1",
          type: INVESTMENT_TYPES.openEnded,
          paymentFrequency: PAYMENT_FREQUENCIES.monthly,
          reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
          startDate: "2026-05-19",
          createdAt: metadata.now,
        },
        {
          id: "investment-1-lifecycle-period-2",
          type: INVESTMENT_TYPES.fixedTerm,
          paymentFrequency: PAYMENT_FREQUENCIES.atMaturity,
          reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
          startDate: "2026-06-01",
          endDate: "2026-12-31",
          createdAt: "2026-06-01T15:30:00.000Z",
        },
      ],
    }
    const updatedAt = new Date("2026-06-15T15:30:00.000Z")

    const updatedInvestment = buildUpdatedInvestmentFromFormValues(
      {
        ...baseFormValues,
        annualRate: 12.5,
        endDate: "2027-01-31",
        investmentType: INVESTMENT_TYPES.fixedTerm,
        name: "Updated CETES",
        originalAmount: 3_000,
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
    expect(updatedInvestment.contributions).toHaveLength(2)
    expect(updatedInvestment.contributions[0]).toEqual(
      existingInvestment.contributions[0],
    )
    expect(updatedInvestment.contributions[1]).toMatchObject({
      amount: 3_000,
      contributionDate: "2026-06-01",
    })
    expect(updatedInvestment.ratePeriods).toHaveLength(2)
    expect(updatedInvestment.ratePeriods[0]).toEqual(
      existingInvestment.ratePeriods[0],
    )
    expect(updatedInvestment.ratePeriods[1]).toMatchObject({
      annualRate: 12.5,
      startDate: "2026-06-01",
    })
    expect(updatedInvestment.lifecyclePeriods).toHaveLength(2)
    expect(updatedInvestment.lifecyclePeriods[0]).toEqual(
      existingInvestment.lifecyclePeriods[0],
    )
    expect(updatedInvestment.lifecyclePeriods[1]).toMatchObject({
      endDate: "2027-01-31",
      paymentFrequency: PAYMENT_FREQUENCIES.monthly,
      reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
      startDate: "2026-06-01",
    })
  })

  it("returns an incomplete preview for invalid form drafts", () => {
    const preview = getInvestmentFormPreview({}, { asOfDate })

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
    expect(preview?.lifecyclePeriods[0]?.type).toBe(INVESTMENT_TYPES.fixedTerm)
  })
})

const baseFormValues = {
  annualRate: 11.25,
  currency: CURRENCIES.mxn,
  institutionName: "CETES Directo",
  name: "CETES 6 months",
  notes: "",
  originalAmount: 10_000,
  paymentFrequency: PAYMENT_FREQUENCIES.monthly,
  reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
} satisfies Omit<InvestmentFormValues, "endDate" | "investmentType">
