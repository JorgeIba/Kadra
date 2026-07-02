import type { MaturityTimelineItem } from "@/app/screens/dashboard/maturity-timeline"

export const DASHBOARD_MATURITY_PRIORITIES = {
  low: "low",
  soon: "soon",
  urgent: "urgent",
} as const

export type DashboardMaturityPriority =
  (typeof DASHBOARD_MATURITY_PRIORITIES)[keyof typeof DASHBOARD_MATURITY_PRIORITIES]

export const DASHBOARD_PANEL_KEYS = {
  activeAssets: "activeAssets",
  activeCapital: "activeCapital",
  earnings: "earnings",
  maturities: "maturities",
  projection: "projection",
} as const

export type DashboardPanelKey =
  (typeof DASHBOARD_PANEL_KEYS)[keyof typeof DASHBOARD_PANEL_KEYS]

export function getDashboardMaturityPriority(
  maturityTimelineItems: MaturityTimelineItem[],
): DashboardMaturityPriority {
  const nearestMaturityDays = maturityTimelineItems.reduce<number | null>(
    (nearestDays, item) => {
      if (nearestDays === null) {
        return item.daysRemaining
      }

      return Math.min(nearestDays, item.daysRemaining)
    },
    null,
  )

  if (nearestMaturityDays === null || nearestMaturityDays > 60) {
    return DASHBOARD_MATURITY_PRIORITIES.low
  }

  if (nearestMaturityDays > 30) {
    return DASHBOARD_MATURITY_PRIORITIES.soon
  }

  return DASHBOARD_MATURITY_PRIORITIES.urgent
}

export function getDashboardPanelOrder(
  maturityPriority: DashboardMaturityPriority,
): DashboardPanelKey[] {
  if (maturityPriority === DASHBOARD_MATURITY_PRIORITIES.urgent) {
    return [
      DASHBOARD_PANEL_KEYS.maturities,
      DASHBOARD_PANEL_KEYS.earnings,
      DASHBOARD_PANEL_KEYS.projection,
      DASHBOARD_PANEL_KEYS.activeCapital,
      DASHBOARD_PANEL_KEYS.activeAssets,
    ]
  }

  if (maturityPriority === DASHBOARD_MATURITY_PRIORITIES.soon) {
    return [
      DASHBOARD_PANEL_KEYS.earnings,
      DASHBOARD_PANEL_KEYS.projection,
      DASHBOARD_PANEL_KEYS.maturities,
      DASHBOARD_PANEL_KEYS.activeCapital,
      DASHBOARD_PANEL_KEYS.activeAssets,
    ]
  }

  return [
    DASHBOARD_PANEL_KEYS.earnings,
    DASHBOARD_PANEL_KEYS.projection,
    DASHBOARD_PANEL_KEYS.activeCapital,
    DASHBOARD_PANEL_KEYS.maturities,
    DASHBOARD_PANEL_KEYS.activeAssets,
  ]
}
