import { describe, expect, it } from "vitest"
import type { Location } from "react-router"
import {
  getActiveSectionFromLocation,
  getActiveSectionFromPathname,
  getActiveNavSectionFromLocation,
  getReturnPathFromLocation,
} from "@/app/routing/active-section"
import { APP_SECTIONS } from "@/app/routing/navigation"

describe("active app section helpers", () => {
  it("maps root paths to their active bottom-nav section", () => {
    expect(getActiveSectionFromPathname("/")).toBe(APP_SECTIONS.dashboard)
    expect(getActiveSectionFromPathname("/assets")).toBe(APP_SECTIONS.assets)
    expect(getActiveSectionFromPathname("/invest")).toBe(APP_SECTIONS.invest)
    expect(getActiveSectionFromPathname("/earnings")).toBe(
      APP_SECTIONS.dashboard,
    )
    expect(getActiveSectionFromPathname("/projection")).toBe(
      APP_SECTIONS.dashboard,
    )
  })

  it("uses the fallback section for non-root routes", () => {
    expect(
      getActiveSectionFromPathname(
        "/investments/investment-1",
        APP_SECTIONS.dashboard,
      ),
    ).toBe(APP_SECTIONS.dashboard)
  })

  it("reads the active nav section from router location state", () => {
    const location = createLocation({
      pathname: "/investments/investment-1",
      state: { activeNavSection: APP_SECTIONS.dashboard },
    })

    expect(getActiveNavSectionFromLocation(location)).toBe(
      APP_SECTIONS.dashboard,
    )
  })

  it("reads the return path from router location state", () => {
    const location = createLocation({
      pathname: "/investments/investment-1",
      state: {
        activeNavSection: APP_SECTIONS.dashboard,
        returnToPath: "/earnings",
      },
    })

    expect(getReturnPathFromLocation(location)).toBe("/earnings")
  })

  it("falls back to assets when no active nav section exists", () => {
    const location = createLocation({
      pathname: "/investments/investment-1",
      state: null,
    })

    expect(getActiveNavSectionFromLocation(location)).toBe(APP_SECTIONS.assets)
    expect(getReturnPathFromLocation(location)).toBeNull()
  })

  it("supports a custom fallback section when no active nav section exists", () => {
    const location = createLocation({
      pathname: "/invest",
      state: null,
    })

    expect(
      getActiveNavSectionFromLocation(location, APP_SECTIONS.dashboard),
    ).toBe(APP_SECTIONS.dashboard)
  })

  it("keeps the active nav section on investment detail routes", () => {
    const location = createLocation({
      pathname: "/investments/investment-1",
      state: { activeNavSection: APP_SECTIONS.dashboard },
    })

    expect(getActiveSectionFromLocation(location)).toBe(APP_SECTIONS.dashboard)
  })

  it("keeps the active nav section on investment edit routes", () => {
    const location = createLocation({
      pathname: "/investments/investment-1/edit",
      state: { activeNavSection: APP_SECTIONS.assets },
    })

    expect(getActiveSectionFromLocation(location)).toBe(APP_SECTIONS.assets)
  })
})

function createLocation({
  pathname,
  state,
}: {
  pathname: string
  state: Location["state"]
}): Location {
  return {
    pathname,
    state,
    hash: "",
    key: "test",
    search: "",
  }
}
