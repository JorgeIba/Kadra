/** Exposes Kadra's locale preference and resolved locale to React components. */
import { createContext, useContext } from "react"
import type { LocalePreference, ResolvedLocale } from "@/app/i18n/locales"

export interface LocaleContextValue {
  activeLocale: ResolvedLocale
  localePreference: LocalePreference
  setLocalePreference: (localePreference: LocalePreference) => void
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext)

  if (context === null) {
    throw new Error("useLocale must be used within LocaleProvider")
  }

  return context
}
