/**
 * Extends i18next's TypeScript definitions with Kadra's translation catalog so
 * translation keys can be checked by the compiler.
 */
import type { TranslationCatalog } from "@/app/i18n/catalogs/en-US"

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation"
    resources: {
      translation: TranslationCatalog
    }
  }
}
