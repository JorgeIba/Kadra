import { describe, expect, it } from "vitest"
import type { Location } from "react-router"
import {
  getActiveSectionFromLocation,
  getActiveSectionFromPathname,
  getActiveNavSectionFromLocation,
  getFallbackPathFromLocation,
  shouldHideBackButtonFromLocation,
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

  it("falls back to assets when no active nav section exists", () => {
    const location = createLocation({
      pathname: "/investments/investment-1",
      state: null,
    })

    expect(getActiveNavSectionFromLocation(location)).toBe(APP_SECTIONS.assets)
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

  it("hides the top-bar back button on main screens", () => {
    expect(
      shouldHideBackButtonFromLocation(
        createLocation({ pathname: "/", state: null }),
      ),
    ).toBe(true)
    expect(
      shouldHideBackButtonFromLocation(
        createLocation({ pathname: "/assets", state: null }),
      ),
    ).toBe(true)
    expect(
      shouldHideBackButtonFromLocation(
        createLocation({ pathname: "/invest", state: null }),
      ),
    ).toBe(true)
  })

  it("keeps the top-bar back button visible on secondary screens", () => {
    expect(
      shouldHideBackButtonFromLocation(
        createLocation({ pathname: "/earnings", state: null }),
      ),
    ).toBe(false)
    expect(
      shouldHideBackButtonFromLocation(
        createLocation({ pathname: "/projection", state: null }),
      ),
    ).toBe(false)
    expect(
      shouldHideBackButtonFromLocation(
        createLocation({ pathname: "/investments/investment-1", state: null }),
      ),
    ).toBe(false)
  })

  it("uses dashboard as the default fallback path", () => {
    expect(
      getFallbackPathFromLocation(
        createLocation({ pathname: "/", state: null }),
      ),
    ).toBe("/")
    expect(
      getFallbackPathFromLocation(
        createLocation({ pathname: "/assets", state: null }),
      ),
    ).toBe("/")
  })

  it("uses dashboard as the direct-entry fallback for dashboard reports", () => {
    const location = createLocation({
      pathname: "/earnings",
      state: null,
    })

    expect(getFallbackPathFromLocation(location)).toBe("/")
  })

  it("uses the active nav section as the fallback for investment routes", () => {
    const location = createLocation({
      pathname: "/investments/investment-1",
      state: { activeNavSection: APP_SECTIONS.dashboard },
    })

    expect(getFallbackPathFromLocation(location)).toBe("/")
  })

  it("uses assets as the default fallback for investment routes", () => {
    const location = createLocation({
      pathname: "/investments/investment-1",
      state: null,
    })

    expect(getFallbackPathFromLocation(location)).toBe("/assets")
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
