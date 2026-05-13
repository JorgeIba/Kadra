import { describe, expect, it } from "vitest"
import {
  CURRENCIES,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
} from "@/domain/investments/constants"
import {
  getEstimatedAccruedReturn,
  getEstimatedPeriodicReturn,
  getPaymentFrequencyDays,
  getSimpleInterest,
} from "@/domain/investments/returns"
import type { Investment } from "@/domain/investments/types"

const fixedInvestment = {
  id: "investment-1",
  name: "Test fixed investment",
  institutionName: "Test institution",
  type: INVESTMENT_TYPES.fixedTerm,
  originalAmount: 36_500,
  annualRate: 10,
  currency: CURRENCIES.mxn,
  paymentFrequency: PAYMENT_FREQUENCIES.monthly,
  reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
  startDate: "2026-01-01",
  endDate: "2026-02-01",
  createdAt: "2026-01-01T18:00:00.000Z",
  updatedAt: "2026-01-01T18:00:00.000Z",
} satisfies Investment

describe("investment return helpers", () => {
  it("calculates simple interest with a 365-day year", () => {
    expect(getSimpleInterest(36_500, 10, 365)).toBe(3_650)
  })

  it("calculates accrued return from active days", () => {
    expect(
      getEstimatedAccruedReturn(
        fixedInvestment,
        new Date("2026-01-16T12:00:00.000Z"),
      ),
    ).toBe(150)
  })

  it("calculates periodic return from payment frequency", () => {
    expect(getEstimatedPeriodicReturn(fixedInvestment)).toBe(300)
  })

  it("maps at-maturity payments to zero periodic days for MVP", () => {
    expect(getPaymentFrequencyDays(PAYMENT_FREQUENCIES.atMaturity)).toBe(0)
  })
})
