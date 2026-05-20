import { describe, expect, it } from "vitest"
import {
  CURRENCIES,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
} from "@/domain/investments"
import { investmentFormSchema } from "@/app/screens/invest/investment-form-schema"

describe("investment form schema", () => {
  it("accepts a valid fixed-term investment draft", () => {
    const result = investmentFormSchema.safeParse({
      ...baseDraft,
      investmentType: INVESTMENT_TYPES.fixedTerm,
      endDate: "2026-12-31",
    })

    expect(result.success).toBe(true)
  })

  it("requires an end date for fixed-term investment drafts", () => {
    const result = investmentFormSchema.safeParse({
      ...baseDraft,
      investmentType: INVESTMENT_TYPES.fixedTerm,
    })

    expect(result.success).toBe(false)
  })

  it("rejects fixed-term investment drafts with invalid end date formats", () => {
    const result = investmentFormSchema.safeParse({
      ...baseDraft,
      investmentType: INVESTMENT_TYPES.fixedTerm,
      endDate: "12/31/2026",
    })

    expect(result.success).toBe(false)
  })

  it("rejects fixed-term investment drafts with impossible end dates", () => {
    const result = investmentFormSchema.safeParse({
      ...baseDraft,
      investmentType: INVESTMENT_TYPES.fixedTerm,
      endDate: "2026-02-30",
    })

    expect(result.success).toBe(false)
  })

  it("accepts an open-ended investment draft without an end date", () => {
    const result = investmentFormSchema.safeParse({
      ...baseDraft,
      investmentType: INVESTMENT_TYPES.openEnded,
    })

    expect(result.success).toBe(true)
  })

  it("rejects at-maturity payments for open-ended investment drafts", () => {
    const result = investmentFormSchema.safeParse({
      ...baseDraft,
      investmentType: INVESTMENT_TYPES.openEnded,
      paymentFrequency: PAYMENT_FREQUENCIES.atMaturity,
    })

    expect(result.success).toBe(false)
  })
})

const baseDraft = {
  annualRate: 11.25,
  currency: CURRENCIES.mxn,
  institutionName: "CETES Directo",
  name: "CETES 6 months",
  notes: "",
  originalAmount: 10_000,
  paymentFrequency: PAYMENT_FREQUENCIES.monthly,
  reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
}
