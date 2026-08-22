import { describe, expect, it } from "vitest"
import {
  LOCALE_PREFERENCE_STORAGE_KEY,
  readLocalePreference,
  saveLocalePreference,
} from "@/app/storage/locale-storage"
import { LOCALE_PREFERENCES } from "@/app/i18n/locales"

describe("locale preference storage", () => {
  it("defaults to the system preference when storage is unavailable", () => {
    expect(readLocalePreference(null)).toBe(LOCALE_PREFERENCES.system)
  })

  it("saves and reads a supported locale preference", () => {
    const storage = createMemoryStorage()

    expect(saveLocalePreference(LOCALE_PREFERENCES.englishUS, storage)).toBe(
      true,
    )
    expect(storage.getItem(LOCALE_PREFERENCE_STORAGE_KEY)).toBe(
      LOCALE_PREFERENCES.englishUS,
    )
    expect(readLocalePreference(storage)).toBe(LOCALE_PREFERENCES.englishUS)
  })

  it("ignores unknown stored preferences", () => {
    const storage = createMemoryStorage({
      [LOCALE_PREFERENCE_STORAGE_KEY]: "fr-FR",
    })

    expect(readLocalePreference(storage)).toBe(LOCALE_PREFERENCES.system)
  })

  it("reports failed writes without throwing", () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("storage unavailable")
      },
    }

    expect(saveLocalePreference(LOCALE_PREFERENCES.spanishMX, storage)).toBe(
      false,
    )
  })
})

function createMemoryStorage(initialValues: Record<string, string> = {}) {
  const values = { ...initialValues }

  return {
    getItem(key: string) {
      return values[key] ?? null
    },
    setItem(key: string, value: string) {
      values[key] = value
    },
  }
}
