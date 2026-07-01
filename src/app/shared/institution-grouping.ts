import type { Investment } from "@/domain/investments"
import type { GroupIdentity } from "@/app/shared/grouping"

const UNKNOWN_INSTITUTION_LABEL = "Unknown institution"

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

export function getInstitutionGroup(institutionName: string): GroupIdentity {
  const displayName = institutionName.trim() || UNKNOWN_INSTITUTION_LABEL

  return {
    key: displayName,
    label: displayName,
  }
}

function normalizeInstitutionName(institutionName: string) {
  return institutionName.trim().toLowerCase()
}
