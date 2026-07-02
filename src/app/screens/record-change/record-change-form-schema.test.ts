import { describe, expect, it } from "vitest"
import {
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
} from "@/domain/investments"
import { createRecordChangeFormSchema } from "@/app/screens/record-change/record-change-form-schema"

describe("record change form schema", () => {
  it("accepts a no-money fixed-term record draft", () => {
    expect(buildSchema().safeParse(baseFixedTermValues).success).toBe(true)
  })

  it("requires a positive amount when adding money", () => {
    expect(
      buildSchema().safeParse({
        ...baseFixedTermValues,
        transactionType: "contribution",
        contributionAmount: 0,
      }).success,
    ).toBe(false)
  })

  it("requires an amount when adding money", () => {
    expect(
      buildSchema().safeParse({
        ...baseFixedTermValues,
        transactionType: "contribution",
      }).success,
    ).toBe(false)
  })

  it("requires a positive amount when withdrawing money", () => {
    expect(
      buildSchema().safeParse({
        ...baseFixedTermValues,
        transactionType: "withdrawal",
        contributionAmount: 0,
      }).success,
    ).toBe(false)
  })

  it("requires an amount when withdrawing money", () => {
    expect(
      buildSchema().safeParse({
        ...baseFixedTermValues,
        transactionType: "withdrawal",
      }).success,
    ).toBe(false)
  })

  it("allows withdrawals within active balance limit", () => {
    expect(
      buildSchema({ activeBalance: 10_000 }).safeParse({
        ...baseFixedTermValues,
        transactionType: "withdrawal",
        contributionAmount: 5_000,
      }).success,
    ).toBe(true)
  })

  it("rejects withdrawals exceeding active balance limit", () => {
    expect(
      buildSchema({ activeBalance: 10_000 }).safeParse({
        ...baseFixedTermValues,
        transactionType: "withdrawal",
        contributionAmount: 12_000,
      }).success,
    ).toBe(false)
  })

  it("rejects withdrawals when active balance is undefined", () => {
    expect(
      buildSchema({ activeBalance: undefined }).safeParse({
        ...baseFixedTermValues,
        transactionType: "withdrawal",
        contributionAmount: 5_000,
      }).success,
    ).toBe(false)
  })

  it("allows omitted amount when no money is being moved", () => {
    expect(buildSchema().safeParse(baseFixedTermValues).success).toBe(true)
  })

  it("rejects fixed-term maturity on the effective date", () => {
    expect(
      buildSchema().safeParse({
        ...baseFixedTermValues,
        effectiveDate: "2026-06-15",
        maturityDate: "2026-06-15",
      }).success,
    ).toBe(false)
  })

  it("rejects future effective dates", () => {
    const parsedValues = buildSchema().safeParse({
      ...baseFixedTermValues,
      effectiveDate: "2026-06-22",
      maturityDate: "2026-12-31",
    })

    expect(parsedValues.success).toBe(false)
  })

  it("rejects effective dates before the latest stored event date when provided", () => {
    const parsedValues = buildSchema({
      latestEventDate: "2026-06-10",
    }).safeParse({
      ...baseFixedTermValues,
      effectiveDate: "2026-06-09",
    })

    expect(parsedValues.success).toBe(false)
  })

  it("rejects at-maturity frequency for open-ended terms", () => {
    expect(
      buildSchema().safeParse({
        ...baseFixedTermValues,
        investmentType: INVESTMENT_TYPES.openEnded,
        paymentFrequency: PAYMENT_FREQUENCIES.atMaturity,
      }).success,
    ).toBe(false)
  })

  it("rejects invalid open-ended maturity dates when they are present", () => {
    expect(
      buildSchema().safeParse({
        ...baseFixedTermValues,
        investmentType: INVESTMENT_TYPES.openEnded,
        maturityDate: "not-a-date",
      }).success,
    ).toBe(false)
  })
})

const baseFixedTermValues = {
  effectiveDate: "2026-06-15",
  transactionType: "none",
  annualRate: 11.25,
  investmentType: INVESTMENT_TYPES.fixedTerm,
  paymentFrequency: PAYMENT_FREQUENCIES.monthly,
  reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
  maturityDate: "2026-12-31",
}

function buildSchema({
  latestEventDate,
  today = "2026-06-21",
  activeBalance,
}: {
  latestEventDate?: string
  today?: string
  activeBalance?: number
} = {}) {
  return createRecordChangeFormSchema({
    latestEventDate,
    today,
    activeBalance,
  })
}
