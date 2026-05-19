import type { Location } from "react-router"
import {
  APP_PATHS,
  APP_SECTIONS,
  type AppSection,
} from "@/app/routing/navigation"

export function getActiveSectionFromPathname(
  pathname: string,
  fallbackSection: AppSection = APP_SECTIONS.assets,
): AppSection {
  if (pathname === APP_PATHS.dashboard) {
    return APP_SECTIONS.dashboard
  }

  if (pathname.startsWith(APP_PATHS.assets)) {
    return APP_SECTIONS.assets
  }

  if (pathname === APP_PATHS.invest) {
    return APP_SECTIONS.invest
  }

  return fallbackSection
}

interface AppRouterLocationState {
  fromSection?: AppSection
}

export function getPreviousSectionFromLocation(location: Location): AppSection {
  const locationState = location.state as AppRouterLocationState | null

  return locationState?.fromSection ?? APP_SECTIONS.assets
}

export function getActiveSectionFromLocation(location: Location): AppSection {
  return getActiveSectionFromPathname(
    location.pathname,
    getPreviousSectionFromLocation(location),
  )
}
