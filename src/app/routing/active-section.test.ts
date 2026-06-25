import { describe, expect, it } from "vitest"
import type { Location } from "react-router"
import {
  getActiveSectionFromLocation,
  getActiveSectionFromPathname,
  getPreviousSectionFromLocation,
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

  it("reads the previous section from router location state", () => {
    const location = createLocation({
      pathname: "/investments/investment-1",
      state: { fromSection: APP_SECTIONS.dashboard },
    })

    expect(getPreviousSectionFromLocation(location)).toBe(
      APP_SECTIONS.dashboard,
    )
  })

  it("falls back to assets when no previous section exists", () => {
    const location = createLocation({
      pathname: "/investments/investment-1",
      state: null,
    })

    expect(getPreviousSectionFromLocation(location)).toBe(APP_SECTIONS.assets)
  })

  it("supports a custom fallback section when no previous section exists", () => {
    const location = createLocation({
      pathname: "/invest",
      state: null,
    })

    expect(
      getPreviousSectionFromLocation(location, APP_SECTIONS.dashboard),
    ).toBe(APP_SECTIONS.dashboard)
  })

  it("keeps the previous section active on investment detail routes", () => {
    const location = createLocation({
      pathname: "/investments/investment-1",
      state: { fromSection: APP_SECTIONS.dashboard },
    })

    expect(getActiveSectionFromLocation(location)).toBe(APP_SECTIONS.dashboard)
  })

  it("keeps the previous section active on investment edit routes", () => {
    const location = createLocation({
      pathname: "/investments/investment-1/edit",
      state: { fromSection: APP_SECTIONS.assets },
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
