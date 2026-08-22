import { describe, expect, it } from "vitest"
import {
  DEFAULT_RESOLVED_LOCALE,
  isLocalePreference,
  LOCALES,
  LOCALE_PREFERENCES,
  resolveLocale,
} from "@/app/i18n/locales"

describe("locale resolution", () => {
  it("keeps an explicit locale preference", () => {
    expect(resolveLocale(LOCALE_PREFERENCES.englishUS, ["es-MX"])).toBe(
      LOCALES.englishUS,
    )
  })

  it("matches a supported locale from the device preference list", () => {
    expect(resolveLocale(LOCALE_PREFERENCES.system, ["fr-FR", "en-US"])).toBe(
      LOCALES.englishUS,
    )
  })

  it("matches a supported language family", () => {
    expect(resolveLocale(LOCALE_PREFERENCES.system, ["es-ES"])).toBe(
      LOCALES.spanishMX,
    )
  })

  it("uses the first supported device preference", () => {
    expect(resolveLocale(LOCALE_PREFERENCES.system, ["es-ES", "en-US"])).toBe(
      LOCALES.spanishMX,
    )
  })

  it("falls back to the product default when no device locale is supported", () => {
    expect(resolveLocale(LOCALE_PREFERENCES.system, ["fr-FR"])).toBe(
      DEFAULT_RESOLVED_LOCALE,
    )
  })

  it("accepts only known persisted locale preferences", () => {
    expect(isLocalePreference(LOCALE_PREFERENCES.system)).toBe(true)
    expect(isLocalePreference(LOCALE_PREFERENCES.englishUS)).toBe(true)
    expect(isLocalePreference(LOCALE_PREFERENCES.spanishMX)).toBe(true)
    expect(isLocalePreference("fr-FR")).toBe(false)
    expect(isLocalePreference(null)).toBe(false)
  })
})
