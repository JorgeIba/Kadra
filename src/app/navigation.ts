import { LayoutDashboard, PlusCircle, WalletCards } from "lucide-react"

interface AppNavItem {
  value: AppSection
  label: string
  icon: typeof LayoutDashboard
}

export const APP_SECTIONS = {
  dashboard: "dashboard",
  assets: "assets",
  invest: "invest",
} as const

export type AppSection = (typeof APP_SECTIONS)[keyof typeof APP_SECTIONS]

export const APP_NAV_ITEMS = [
  {
    value: APP_SECTIONS.dashboard,
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    value: APP_SECTIONS.assets,
    label: "Assets",
    icon: WalletCards,
  },
  {
    value: APP_SECTIONS.invest,
    label: "Invest",
    icon: PlusCircle,
  },
] as const satisfies ReadonlyArray<AppNavItem>
