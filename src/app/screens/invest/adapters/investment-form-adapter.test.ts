import { describe, expect, it } from "vitest"
import {
  CURRENCIES,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
} from "@/domain/investments"
import {
  createInvestmentFromFormValues,
  getInvestmentFormPreview,
  mapInvestmentFormToInvestment,
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
      annualRate: 11.25,
      createdAt: metadata.now,
      currency: CURRENCIES.mxn,
      endDate: "2026-12-31",
      id: metadata.id,
      institutionName: "CETES Directo",
      name: "CETES 6 months",
      originalAmount: 10_000,
      paymentFrequency: PAYMENT_FREQUENCIES.monthly,
      reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
      startDate: metadata.startDate,
      type: INVESTMENT_TYPES.fixedTerm,
      updatedAt: metadata.now,
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

    expect(investment.type).toBe(INVESTMENT_TYPES.openEnded)
    expect("endDate" in investment).toBe(false)
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
    const investment = createInvestmentFromFormValues(
      {
        ...baseFormValues,
        endDate: "2026-12-31",
        investmentType: INVESTMENT_TYPES.fixedTerm,
      },
      { asOfDate, id: metadata.id },
    )

    expect(investment.createdAt).toBe(metadata.now)
    expect(investment.updatedAt).toBe(metadata.now)
    expect(investment.startDate).toBe(metadata.startDate)
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
      type: INVESTMENT_TYPES.fixedTerm,
    })
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
