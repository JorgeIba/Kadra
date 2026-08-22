/**
 * Defines Kadra's supported locale policy, including system-language matching
 * and the product fallback used when no supported locale is detected.
 */
export const LOCALES = {
  englishUS: "en-US",
  spanishMX: "es-MX",
} as const

export type ResolvedLocale = (typeof LOCALES)[keyof typeof LOCALES]

export const LOCALE_PREFERENCES = {
  system: "system",
  englishUS: LOCALES.englishUS,
  spanishMX: LOCALES.spanishMX,
} as const

export type LocalePreference =
  (typeof LOCALE_PREFERENCES)[keyof typeof LOCALE_PREFERENCES]

export const DEFAULT_RESOLVED_LOCALE = LOCALES.englishUS

const LANGUAGE_FAMILY_LOCALES: Record<string, ResolvedLocale> = {
  en: LOCALES.englishUS,
  es: LOCALES.spanishMX,
}

export function resolveLocale(
  localePreference: LocalePreference,
  systemLocales = getSystemLocalePreferences(),
): ResolvedLocale {
  // A manually selected preference overrides the device language.
  if (localePreference !== LOCALE_PREFERENCES.system) {
    return localePreference
  }

  // Try device languages in priority order and use the first locale Kadra supports.
  for (const deviceLocale of systemLocales) {
    const resolvedLocale = findSupportedLocale(deviceLocale)

    if (resolvedLocale !== null) {
      return resolvedLocale
    }
  }

  return DEFAULT_RESOLVED_LOCALE
}

export function isLocalePreference(
  value: string | null,
): value is LocalePreference {
  return (
    value === LOCALE_PREFERENCES.system ||
    value === LOCALE_PREFERENCES.englishUS ||
    value === LOCALE_PREFERENCES.spanishMX
  )
}

export function getSystemLocalePreferences(): string[] {
  if (typeof navigator === "undefined") {
    return []
  }

  return navigator.languages.length > 0
    ? [...navigator.languages]
    : [navigator.language]
}

function findSupportedLocale(deviceLocale: string): ResolvedLocale | null {
  // Normalize browser-provided locale strings before comparing them.
  const normalizedLocale = deviceLocale.trim().toLowerCase()

  if (normalizedLocale === LOCALES.englishUS.toLowerCase()) {
    return LOCALES.englishUS
  }

  if (normalizedLocale === LOCALES.spanishMX.toLowerCase()) {
    return LOCALES.spanishMX
  }

  // Map other regions in the same language family to Kadra's catalog.
  return LANGUAGE_FAMILY_LOCALES[normalizedLocale.split("-")[0] ?? ""] ?? null
}
