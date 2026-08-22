/**
 * Persists the language preference independently from portfolio storage and
 * treats browser storage as optional and untrusted input.
 */
import {
  isLocalePreference,
  LOCALE_PREFERENCES,
  type LocalePreference,
} from "@/app/i18n/locales"

export const LOCALE_PREFERENCE_STORAGE_KEY = "kadra.localePreference.v1"

type LocaleStorage = Pick<Storage, "getItem" | "setItem">

export function readLocalePreference(
  storage = getBrowserStorage(),
): LocalePreference {
  if (storage === null) {
    return LOCALE_PREFERENCES.system
  }

  try {
    const storedPreference = storage.getItem(LOCALE_PREFERENCE_STORAGE_KEY)

    return isLocalePreference(storedPreference)
      ? storedPreference
      : LOCALE_PREFERENCES.system
  } catch {
    return LOCALE_PREFERENCES.system
  }
}

export function saveLocalePreference(
  localePreference: LocalePreference,
  storage = getBrowserStorage(),
): boolean {
  if (storage === null) {
    return false
  }

  try {
    storage.setItem(LOCALE_PREFERENCE_STORAGE_KEY, localePreference)
    return true
  } catch {
    return false
  }
}

function getBrowserStorage(): LocaleStorage | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}
