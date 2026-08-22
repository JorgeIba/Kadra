/** Spanish (Mexico) catalog; its shape is checked against the English contract. */
import type { TranslationCatalog } from "@/app/i18n/catalogs/en-US"

export const esMX = {
  common: {
    language: {
      label: "Idioma",
      englishUS: "English (United States)",
      spanishMX: "Español (México)",
      system: "Usar el idioma del dispositivo",
    },
  },
} satisfies TranslationCatalog
