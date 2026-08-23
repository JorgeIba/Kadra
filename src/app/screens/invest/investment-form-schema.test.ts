import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  CURRENCIES,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
} from "@/domain/investments"
import { i18n } from "@/app/i18n/i18n"
import { createInvestmentFormSchema } from "@/app/screens/invest/investment-form-schema"

const investmentFormSchema = createInvestmentFormSchema(i18n.t)

describe("investment form schema", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-06-20T12:00:00.000Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

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

  it("rejects fixed-term investment drafts that end today", () => {
    const result = investmentFormSchema.safeParse({
      ...baseDraft,
      investmentType: INVESTMENT_TYPES.fixedTerm,
      endDate: "2026-06-20",
    })

    expect(result.success).toBe(false)
  })

  it("rejects drafts with a future start date", () => {
    const result = investmentFormSchema.safeParse({
      ...baseDraft,
      startDate: "2026-06-21",
      investmentType: INVESTMENT_TYPES.fixedTerm,
      endDate: "2026-12-31",
    })

    expect(result.success).toBe(false)
  })

  it("accepts a fixed-term draft that ended before today when it ends after the start date", () => {
    const result = investmentFormSchema.safeParse({
      ...baseDraft,
      startDate: "2026-01-01",
      investmentType: INVESTMENT_TYPES.fixedTerm,
      endDate: "2026-03-01",
    })

    expect(result.success).toBe(true)
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
  startDate: "2026-06-20",
  contributionAmount: 10_000,
  paymentFrequency: PAYMENT_FREQUENCIES.monthly,
  reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
}
