/** Public entry point for Kadra's locale policy, provider, and i18next setup. */
export { LocaleProvider } from "@/app/i18n/LocaleProvider"
export { useLocale } from "@/app/i18n/locale-context"
export {
  DEFAULT_RESOLVED_LOCALE,
  getSystemLocalePreferences,
  isLocalePreference,
  LOCALES,
  LOCALE_PREFERENCES,
  resolveLocale,
  type LocalePreference,
  type ResolvedLocale,
} from "@/app/i18n/locales"
export { i18n } from "@/app/i18n/i18n"
