import { describe, expect, it } from "vitest"
import {
  compareCalendarDatesAscending,
  getDaysActive,
  getDaysBetween,
  isCalendarDateString,
  isCalendarDateWithinRange,
  isOnOrAfterDate,
} from "@/domain/investments/dates"

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
      getDaysActive("2026-01-01", new Date("2026-01-16T12:00:00.000Z")),
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

  it("checks whether a calendar date falls inside a half-open range", () => {
    expect(
      isCalendarDateWithinRange("2026-01-01", "2026-01-01", "2026-02-01"),
    ).toBe(true)
    expect(
      isCalendarDateWithinRange("2026-01-31", "2026-01-01", "2026-02-01"),
    ).toBe(true)
    expect(
      isCalendarDateWithinRange("2026-02-01", "2026-01-01", "2026-02-01"),
    ).toBe(false)
    expect(isCalendarDateWithinRange("2026-03-01", "2026-01-01")).toBe(true)
    expect(isCalendarDateWithinRange("2026-01-01", null, "2026-02-01")).toBe(
      true,
    )
    expect(isCalendarDateWithinRange("2026-02-01", null, "2026-02-01")).toBe(
      false,
    )
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
