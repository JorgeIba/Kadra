import { describe, expect, it } from "vitest"
import {
  getPaymentFrequencyDays,
  PAYMENT_FREQUENCIES,
} from "@/domain/investments/constants"
import {
  getEstimatedInterestForDays,
  getEstimatedInterestForPaymentFrequency,
  getEstimatedMonthlyInterest,
  getEstimatedYearlyInterest,
  getCompoundInterest,
  getCompoundInterestForPeriod,
  getInterestForPeriod,
  getProjectedTotalInterestAtDate,
  getSimpleInterest,
  getTotalInterest,
  type InterestPeriod,
} from "@/domain/investments/interest"

const interestPeriods = [
  {
    startingAmount: 36_500,
    annualRate: 10,
    startDate: "2026-01-01",
    endDate: "2026-01-16",
  },
  {
    startingAmount: 36_500,
    annualRate: 10,
    startDate: "2026-01-16",
    endDate: "2026-02-01",
  },
] satisfies InterestPeriod[]

describe("interest helpers", () => {
  it("calculates simple interest with a 365-day year", () => {
    expect(getSimpleInterest(36_500, 10, 365)).toBe(3_650)
  })

  it("calculates compound interest at the selected frequency", () => {
    expect(getCompoundInterest(100, 10, 365, 1)).toBeCloseTo(10.515578161623253)
    expect(getCompoundInterest(10_000, 12, 60, 30)).toBeCloseTo(
      198.23306436479652,
    )
  })

  it("falls back to simple interest when there is no compounding frequency", () => {
    expect(getCompoundInterest(36_500, 10, 15, 0)).toBe(150)
  })

  it("calculates the interest for one period", () => {
    expect(getInterestForPeriod(interestPeriods[0])).toBe(150)
  })

  it("calculates the compound interest for one period", () => {
    expect(
      getCompoundInterestForPeriod({
        startingAmount: 10_000,
        annualRate: 12,
        startDate: "2026-01-01",
        endDate: "2026-03-02",
        compoundingFrequencyDays: 30,
      }),
    ).toBeCloseTo(198.23306436479652)
  })

  it("accumulates the total interest across multiple periods", () => {
    expect(getTotalInterest(interestPeriods)).toBe(310)
  })

  it("projects total interest up to a target date", () => {
    expect(getProjectedTotalInterestAtDate(interestPeriods, "2026-01-16")).toBe(
      150,
    )
    expect(getProjectedTotalInterestAtDate(interestPeriods, "2026-02-01")).toBe(
      310,
    )
  })

  it("estimates interest for a payment frequency", () => {
    expect(
      getEstimatedInterestForPaymentFrequency(
        36_500,
        10,
        PAYMENT_FREQUENCIES.monthly,
      ),
    ).toBe(300)
  })

  it("estimates monthly, yearly, and explicit-day interest", () => {
    expect(getEstimatedMonthlyInterest(36_500, 10)).toBe(300)
    expect(getEstimatedYearlyInterest(36_500, 10)).toBe(3_650)
    expect(getEstimatedInterestForDays(36_500, 10, 15)).toBe(150)
  })

  it("maps at-maturity payments to zero periodic days for MVP", () => {
    expect(getPaymentFrequencyDays(PAYMENT_FREQUENCIES.atMaturity)).toBe(0)
  })
})
