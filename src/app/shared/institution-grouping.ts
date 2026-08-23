import type { Investment } from "@/domain/investments"
import type { GroupIdentity } from "@/app/shared/grouping"

export const UNKNOWN_INSTITUTION_GROUP_KEY = "unknown-institution"

export function getInstitutionSuggestions(investments: Investment[]): string[] {
  const suggestions = new Map<string, string>()

  investments.forEach((investment) => {
    const institutionName = investment.institutionName.trim()

    if (institutionName === "") {
      return
    }

    const normalizedName = normalizeInstitutionName(institutionName)

    if (!suggestions.has(normalizedName)) {
      suggestions.set(normalizedName, institutionName)
    }
  })

  return [...suggestions.values()].sort((leftName, rightName) => {
    return leftName.localeCompare(rightName)
  })
}

export function getInstitutionGroup(
  institutionName: string,
  unknownInstitutionLabel: string,
): GroupIdentity {
  const trimmedInstitutionName = institutionName.trim()

  return {
    key:
      trimmedInstitutionName === ""
        ? UNKNOWN_INSTITUTION_GROUP_KEY
        : trimmedInstitutionName,
    label:
      trimmedInstitutionName === ""
        ? unknownInstitutionLabel
        : trimmedInstitutionName,
  }
}

function normalizeInstitutionName(institutionName: string) {
  return institutionName.trim().toLowerCase()
}
