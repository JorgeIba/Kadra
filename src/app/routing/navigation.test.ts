import { describe, expect, it } from "vitest"
import {
  APP_PATHS,
  APP_SECTIONS,
  getEarningsPath,
  getInvestmentDetailPath,
  getInvestmentEditPath,
  getSectionPath,
} from "@/app/routing/navigation"

describe("app navigation helpers", () => {
  it("maps root sections to navigation paths", () => {
    expect(getSectionPath(APP_SECTIONS.dashboard)).toBe(APP_PATHS.dashboard)
    expect(getSectionPath(APP_SECTIONS.assets)).toBe(APP_PATHS.assets)
    expect(getSectionPath(APP_SECTIONS.invest)).toBe(APP_PATHS.invest)
  })

  it("builds investment detail paths from investment ids", () => {
    expect(getInvestmentDetailPath("investment-1")).toBe(
      "/investments/investment-1",
    )
  })

  it("builds investment edit paths from investment ids", () => {
    expect(getInvestmentEditPath("investment-1")).toBe(
      "/investments/investment-1/edit",
    )
  })

  it("builds the earnings path", () => {
    expect(getEarningsPath()).toBe(APP_PATHS.earnings)
  })

  it("encodes investment ids for safe URL path usage", () => {
    expect(getInvestmentDetailPath("my investment/2026")).toBe(
      "/investments/my%20investment%2F2026",
    )
    expect(getInvestmentEditPath("my investment/2026")).toBe(
      "/investments/my%20investment%2F2026/edit",
    )
  })
})
