import { describe, expect, it } from "vitest"
import { formatDisplayDate, formatPercentage } from "@/lib/formatters"

describe("formatDisplayDate", () => {
  it("uses the requested locale without shifting the calendar date", () => {
    const date = "2026-08-14"

    expect(formatDisplayDate(date, "en-US")).toBe("Aug 14, 2026")
    expect(formatDisplayDate(date, "es-MX")).toBe("14 ago 2026")
  })

  it("keeps January and December in the requested calendar month", () => {
    expect(formatDisplayDate("2026-01-05", "en-US")).toBe("Jan 5, 2026")
    expect(formatDisplayDate("2026-12-05", "es-MX")).toBe("5 dic 2026")
  })

  it("formats a leap-day calendar date", () => {
    expect(formatDisplayDate("2024-02-29", "en-US")).toBe("Feb 29, 2024")
    expect(formatDisplayDate("2024-02-29", "es-MX")).toBe("29 feb 2024")
  })
})

describe("formatPercentage", () => {
  it("formats percentage values for the requested locale", () => {
    expect(formatPercentage(11.25, "en-US")).toBe("11.25%")
    expect(formatPercentage(11.25, "es-MX")).toBe("11.25%")
  })

  it("respects whole-number precision", () => {
    expect(formatPercentage(11.25, "en-US", { maximumFractionDigits: 0 })).toBe(
      "11%",
    )
    expect(formatPercentage(11.25, "es-MX", { maximumFractionDigits: 0 })).toBe(
      "11%",
    )
  })
})
