import { describe, expect, it } from "vitest"
import {
  CURRENCIES,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
} from "@/domain/investments/constants"
import {
  compareCalendarDatesAscending,
  getDaysActive,
  getDaysBetween,
  isCalendarDateString,
  isOnOrAfterDate,
} from "@/domain/investments/dates"
import type { Investment } from "@/domain/investments/types"

const fixedInvestment = {
  id: "investment-1",
  name: "Test fixed investment",
  institutionName: "Test institution",
  type: INVESTMENT_TYPES.fixedTerm,
  originalAmount: 10_000,
  annualRate: 10,
  currency: CURRENCIES.mxn,
  paymentFrequency: PAYMENT_FREQUENCIES.monthly,
  reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
  startDate: "2026-01-01",
  endDate: "2026-01-31",
  createdAt: "2026-01-01T18:00:00.000Z",
  updatedAt: "2026-01-01T18:00:00.000Z",
} satisfies Investment

describe("investment date helpers", () => {
  it("calculates calendar days between two date-only strings", () => {
    expect(getDaysBetween("2026-01-01", "2026-01-31")).toBe(30)
  })

  it("compares calendar date strings in ascending order", () => {
    expect(
      compareCalendarDatesAscending("2026-01-01", "2026-01-31"),
    ).toBeLessThan(0)
    expect(
      compareCalendarDatesAscending("2026-01-31", "2026-01-01"),
    ).toBeGreaterThan(0)
    expect(compareCalendarDatesAscending("2026-01-01", "2026-01-01")).toBe(0)
  })

  it("does not return negative day counts", () => {
    expect(getDaysBetween("2026-01-31", "2026-01-01")).toBe(0)
  })

  it("calculates active days from an explicit as-of date", () => {
    expect(
      getDaysActive(fixedInvestment, new Date("2026-01-16T12:00:00.000Z")),
    ).toBe(15)
  })

  it("checks whether an exact date is on or after a calendar date", () => {
    expect(
      isOnOrAfterDate(new Date("2026-01-31T12:00:00.000Z"), "2026-01-31"),
    ).toBe(true)
    expect(
      isOnOrAfterDate(new Date("2026-01-30T12:00:00.000Z"), "2026-01-31"),
    ).toBe(false)
  })

  it("accepts valid calendar date strings", () => {
    expect(isCalendarDateString("2026-05-19")).toBe(true)
  })

  it("rejects non-calendar date string formats", () => {
    expect(isCalendarDateString("05/19/2026")).toBe(false)
  })

  it("rejects impossible calendar date strings", () => {
    expect(isCalendarDateString("2026-02-30")).toBe(false)
  })
})
