import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
} from "@/domain/investments"
import {
  createRecordChangeFormSchema,
  recordChangeFormSchema,
} from "@/app/screens/record-change/record-change-form-schema"

describe("record change form schema", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-06-21T12:00:00.000Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("accepts a no-money fixed-term record draft", () => {
    expect(recordChangeFormSchema.safeParse(baseFixedTermValues).success).toBe(
      true,
    )
  })

  it("requires a positive amount when adding money", () => {
    expect(
      recordChangeFormSchema.safeParse({
        ...baseFixedTermValues,
        hasContribution: true,
        contributionAmount: 0,
      }).success,
    ).toBe(false)
  })

  it("requires an amount when adding money", () => {
    expect(
      recordChangeFormSchema.safeParse({
        ...baseFixedTermValues,
        hasContribution: true,
      }).success,
    ).toBe(false)
  })

  it("allows omitted amount when no money is being added", () => {
    expect(recordChangeFormSchema.safeParse(baseFixedTermValues).success).toBe(
      true,
    )
  })

  it("rejects fixed-term maturity on the effective date", () => {
    expect(
      recordChangeFormSchema.safeParse({
        ...baseFixedTermValues,
        effectiveDate: "2026-06-15",
        maturityDate: "2026-06-15",
      }).success,
    ).toBe(false)
  })

  it("rejects future effective dates", () => {
    const parsedValues = recordChangeFormSchema.safeParse({
      ...baseFixedTermValues,
      effectiveDate: "2026-06-22",
      maturityDate: "2026-12-31",
    })

    expect(parsedValues.success).toBe(false)
  })

  it("rejects effective dates before the latest stored event date when provided", () => {
    const schema = createRecordChangeFormSchema({
      latestEventDate: "2026-06-10",
      today: "2026-06-21",
    })

    const parsedValues = schema.safeParse({
      ...baseFixedTermValues,
      effectiveDate: "2026-06-09",
    })

    expect(parsedValues.success).toBe(false)
  })

  it("rejects at-maturity frequency for open-ended terms", () => {
    expect(
      recordChangeFormSchema.safeParse({
        ...baseFixedTermValues,
        investmentType: INVESTMENT_TYPES.openEnded,
        paymentFrequency: PAYMENT_FREQUENCIES.atMaturity,
      }).success,
    ).toBe(false)
  })

  it("rejects invalid open-ended maturity dates when they are present", () => {
    expect(
      recordChangeFormSchema.safeParse({
        ...baseFixedTermValues,
        investmentType: INVESTMENT_TYPES.openEnded,
        maturityDate: "not-a-date",
      }).success,
    ).toBe(false)
  })
})

const baseFixedTermValues = {
  effectiveDate: "2026-06-15",
  hasContribution: false,
  annualRate: 11.25,
  investmentType: INVESTMENT_TYPES.fixedTerm,
  paymentFrequency: PAYMENT_FREQUENCIES.monthly,
  reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
  maturityDate: "2026-12-31",
}
