import { describe, expect, it } from "vitest"
import {
  DASHBOARD_MATURITY_PRIORITIES,
  DASHBOARD_PANEL_KEYS,
  getDashboardMaturityPriority,
  getDashboardPanelOrder,
} from "@/app/screens/dashboard/dashboard-panel-order"
import type { MaturityTimelineItem } from "@/app/screens/dashboard/maturity-timeline"

describe("dashboard panel order", () => {
  it("keeps maturities low when there are no maturity items", () => {
    expect(getDashboardMaturityPriority([])).toBe(
      DASHBOARD_MATURITY_PRIORITIES.low,
    )
    expect(getDashboardPanelOrder(DASHBOARD_MATURITY_PRIORITIES.low)).toEqual([
      DASHBOARD_PANEL_KEYS.earnings,
      DASHBOARD_PANEL_KEYS.projection,
      DASHBOARD_PANEL_KEYS.activeCapital,
      DASHBOARD_PANEL_KEYS.maturities,
      DASHBOARD_PANEL_KEYS.activeAssets,
    ])
  })

  it("keeps maturities low when the nearest maturity is more than 60 days away", () => {
    expect(getDashboardMaturityPriority([buildMaturityItem(61)])).toBe(
      DASHBOARD_MATURITY_PRIORITIES.low,
    )
  })

  it("moves maturities to the middle when the nearest maturity is within 31 to 60 days", () => {
    expect(
      getDashboardMaturityPriority([
        buildMaturityItem(90),
        buildMaturityItem(45),
      ]),
    ).toBe(DASHBOARD_MATURITY_PRIORITIES.soon)
    expect(getDashboardPanelOrder(DASHBOARD_MATURITY_PRIORITIES.soon)).toEqual([
      DASHBOARD_PANEL_KEYS.earnings,
      DASHBOARD_PANEL_KEYS.projection,
      DASHBOARD_PANEL_KEYS.maturities,
      DASHBOARD_PANEL_KEYS.activeCapital,
      DASHBOARD_PANEL_KEYS.activeAssets,
    ])
  })

  it("moves maturities near the top when the nearest maturity is within 30 days", () => {
    expect(
      getDashboardMaturityPriority([
        buildMaturityItem(45),
        buildMaturityItem(30),
      ]),
    ).toBe(DASHBOARD_MATURITY_PRIORITIES.urgent)
    expect(
      getDashboardPanelOrder(DASHBOARD_MATURITY_PRIORITIES.urgent),
    ).toEqual([
      DASHBOARD_PANEL_KEYS.maturities,
      DASHBOARD_PANEL_KEYS.earnings,
      DASHBOARD_PANEL_KEYS.projection,
      DASHBOARD_PANEL_KEYS.activeCapital,
      DASHBOARD_PANEL_KEYS.activeAssets,
    ])
  })
})

function buildMaturityItem(daysRemaining: number): MaturityTimelineItem {
  return {
    daysRemaining,
    endDate: "2026-12-31",
    id: `maturity-${daysRemaining}`,
    institutionName: "CETES",
    name: `${daysRemaining} day maturity`,
  }
}
