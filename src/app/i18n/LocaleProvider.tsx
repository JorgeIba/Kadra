/**
 * Bridges browser locale and storage signals into React and i18next, keeping
 * the active locale and document language synchronized.
 */
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { I18nextProvider } from "react-i18next"
import {
  getSystemLocalePreferences,
  resolveLocale,
  type LocalePreference,
  type ResolvedLocale,
} from "@/app/i18n/locales"
import { i18n } from "@/app/i18n/i18n"
import {
  LOCALE_PREFERENCE_STORAGE_KEY,
  readLocalePreference,
  saveLocalePreference,
} from "@/app/storage/locale-storage"
import {
  LocaleContext,
  type LocaleContextValue,
} from "@/app/i18n/locale-context"

export function LocaleProvider({
  children,
}: {
  children: ReactNode
}): ReactNode {
  // Read the saved user choice once; this is the preference, not the final locale.
  const [localePreference, setLocalePreference] = useState<LocalePreference>(
    () => {
      return readLocalePreference()
    },
  )

  // Keep browser language preferences in React so system-language changes can
  // recalculate the active locale and update the rendered application.
  const [systemLocalePreferences, setSystemLocalePreferences] = useState<
    string[]
  >(() => {
    return getSystemLocalePreferences()
  })

  // Resolve the concrete locale from the user's preference and device languages.
  const activeLocale: ResolvedLocale = resolveLocale(
    localePreference,
    systemLocalePreferences,
  )

  // Persist changes made through the future language settings UI.
  useEffect(() => {
    saveLocalePreference(localePreference)
  }, [localePreference])

  // Subscribe once to locale changes that originate outside React.
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    // Re-read device languages so system mode can resolve a new active locale.
    function handleSystemLanguageChange(): void {
      setSystemLocalePreferences(getSystemLocalePreferences())
    }

    // Bring a preference changed in another browser tab into this React tree.
    function handleStorageChange(event: StorageEvent): void {
      if (event.key !== LOCALE_PREFERENCE_STORAGE_KEY) {
        return
      }

      const nextLocalePreference = readLocalePreference()
      setLocalePreference(nextLocalePreference)
    }

    window.addEventListener("languagechange", handleSystemLanguageChange)
    window.addEventListener("storage", handleStorageChange)

    // Remove global listeners when the provider leaves the React tree.
    return () => {
      window.removeEventListener("languagechange", handleSystemLanguageChange)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // Synchronize the resolved locale with i18next and the document metadata.
  useLayoutEffect(() => {
    void i18n.changeLanguage(activeLocale)

    if (typeof document !== "undefined") {
      document.documentElement.lang = activeLocale
      document.documentElement.dir = "ltr"
    }
  }, [activeLocale])

  // Expose locale state and its updater while keeping the context value stable
  // when neither the preference nor active locale has changed.
  const value = useMemo<LocaleContextValue>(() => {
    return {
      activeLocale,
      localePreference,
      setLocalePreference,
    }
  }, [activeLocale, localePreference])

  // Make Kadra's locale context and i18next available to every descendant.
  return (
    <LocaleContext.Provider value={value}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </LocaleContext.Provider>
  )
}
