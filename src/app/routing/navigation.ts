import { LayoutDashboard, PlusCircle, WalletCards } from "lucide-react"

interface AppNavItem {
  value: AppSection
  path: string
  icon: typeof LayoutDashboard
}

export const APP_SECTIONS = {
  dashboard: "dashboard",
  assets: "assets",
  invest: "invest",
} as const

export type AppSection = (typeof APP_SECTIONS)[keyof typeof APP_SECTIONS]

export const APP_ROUTE_PATHS = {
  dashboard: "/",
  assets: "assets",
  invest: "invest",
  earnings: "earnings",
  projection: "projection",
  investmentDetail: "investments/:investmentId",
  investmentEdit: "investments/:investmentId/edit",
  investmentRecordChange: "investments/:investmentId/record-change",
} as const

export const APP_PATHS = {
  dashboard: APP_ROUTE_PATHS.dashboard,
  assets: `/${APP_ROUTE_PATHS.assets}`,
  invest: `/${APP_ROUTE_PATHS.invest}`,
  earnings: `/${APP_ROUTE_PATHS.earnings}`,
  projection: `/${APP_ROUTE_PATHS.projection}`,
} as const

export function getInvestmentDetailPath(investmentId: string) {
  return `/${APP_ROUTE_PATHS.investmentDetail.replace(
    ":investmentId",
    encodeURIComponent(investmentId),
  )}`
}

export function getInvestmentEditPath(investmentId: string) {
  return `/${APP_ROUTE_PATHS.investmentEdit.replace(
    ":investmentId",
    encodeURIComponent(investmentId),
  )}`
}

export function getInvestmentRecordChangePath(investmentId: string) {
  return `/${APP_ROUTE_PATHS.investmentRecordChange.replace(
    ":investmentId",
    encodeURIComponent(investmentId),
  )}`
}

export function getEarningsPath() {
  return APP_PATHS.earnings
}

export function getProjectionPath() {
  return APP_PATHS.projection
}

export function getSectionPath(section: AppSection) {
  switch (section) {
    case APP_SECTIONS.dashboard:
      return APP_PATHS.dashboard
    case APP_SECTIONS.assets:
      return APP_PATHS.assets
    case APP_SECTIONS.invest:
      return APP_PATHS.invest
  }
}

export const APP_NAV_ITEMS = [
  {
    value: APP_SECTIONS.dashboard,
    path: APP_PATHS.dashboard,
    icon: LayoutDashboard,
  },
  {
    value: APP_SECTIONS.assets,
    path: APP_PATHS.assets,
    icon: WalletCards,
  },
  {
    value: APP_SECTIONS.invest,
    path: APP_PATHS.invest,
    icon: PlusCircle,
  },
] as const satisfies ReadonlyArray<AppNavItem>
