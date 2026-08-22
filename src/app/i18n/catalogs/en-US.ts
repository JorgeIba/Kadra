/**
 * English catalog and shared catalog contract. Every supported locale must
 * expose the same translation-key shape.
 */
export interface TranslationCatalog {
  common: {
    language: {
      englishUS: string
      spanishMX: string
      system: string
    }
  }
}

export const enUS = {
  common: {
    language: {
      englishUS: "English (United States)",
      spanishMX: "Español (México)",
      system: "Use device language",
    },
  },
} satisfies TranslationCatalog
