import type { Location } from "react-router"
import {
  APP_PATHS,
  APP_SECTIONS,
  getSectionPath,
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

  if (pathname === APP_PATHS.earnings || pathname === APP_PATHS.projection) {
    return APP_SECTIONS.dashboard
  }

  return fallbackSection
}

interface AppRouterLocationState {
  activeNavSection?: AppSection
}

export function getActiveNavSectionFromLocation(
  location: Location,
  fallbackSection: AppSection = APP_SECTIONS.assets,
): AppSection {
  const locationState = location.state as AppRouterLocationState | null

  return locationState?.activeNavSection ?? fallbackSection
}

export function shouldHideBackButtonFromLocation(location: Location): boolean {
  return (
    location.pathname === APP_PATHS.dashboard ||
    location.pathname === APP_PATHS.assets ||
    location.pathname === APP_PATHS.invest
  )
}

export function getFallbackPathFromLocation(location: Location): string {
  if (location.pathname === APP_PATHS.earnings) {
    return getSectionPath(APP_SECTIONS.dashboard)
  }

  if (location.pathname === APP_PATHS.projection) {
    return getSectionPath(APP_SECTIONS.dashboard)
  }

  if (location.pathname.startsWith("/investments/")) {
    return getSectionPath(getActiveNavSectionFromLocation(location))
  }

  return getSectionPath(APP_SECTIONS.dashboard)
}

export function getActiveSectionFromLocation(location: Location): AppSection {
  return getActiveSectionFromPathname(
    location.pathname,
    getActiveNavSectionFromLocation(location),
  )
}
