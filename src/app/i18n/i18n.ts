/**
 * Creates the app-owned i18next instance and loads bundled catalogs for
 * synchronous, offline translation lookup.
 */
import i18next from "i18next"
import { initReactI18next } from "react-i18next"
import { enUS } from "@/app/i18n/catalogs/en-US"
import { esMX } from "@/app/i18n/catalogs/es-MX"
import { DEFAULT_RESOLVED_LOCALE, LOCALES } from "@/app/i18n/locales"

export const i18n = i18next.createInstance()

void i18n.use(initReactI18next).init({
  fallbackLng: DEFAULT_RESOLVED_LOCALE,
  initAsync: false,
  interpolation: {
    escapeValue: false,
  },
  lng: DEFAULT_RESOLVED_LOCALE,
  resources: {
    [LOCALES.englishUS]: { translation: enUS },
    [LOCALES.spanishMX]: { translation: esMX },
  },
  returnNull: false,
  supportedLngs: [LOCALES.englishUS, LOCALES.spanishMX],
})
