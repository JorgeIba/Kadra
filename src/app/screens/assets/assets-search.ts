import type { Investment, ResolvedInvestment } from "@/domain/investments"

const MIN_SUGGESTION_QUERY_LENGTH = 2
const MAX_SUGGESTION_COUNT = 6

export function getSearchedInvestments(
  investments: ResolvedInvestment[],
  query: string,
): ResolvedInvestment[] {
  const normalizedQuery = normalizeSearchText(query)

  if (normalizedQuery === "") {
    return [...investments]
  }

  return investments.filter((investment) => {
    return [
      investment.name,
      investment.institutionName,
      investment.notes ?? "",
    ].some((field) => {
      return normalizeSearchText(field).includes(normalizedQuery)
    })
  })
}

export function getAssetSearchSuggestions(
  investments: Investment[],
  query: string,
): string[] {
  const normalizedQuery = normalizeSearchText(query)

  if (normalizedQuery.length < MIN_SUGGESTION_QUERY_LENGTH) {
    return []
  }

  const candidates = new Map<string, string>()

  investments.forEach((investment) => {
    for (const value of [investment.name, investment.institutionName]) {
      const displayValue = value.trim()
      const normalizedValue = normalizeSearchText(displayValue)

      if (normalizedValue === "" || candidates.has(normalizedValue)) {
        continue
      }

      candidates.set(normalizedValue, displayValue)
    }
  })

  return [...candidates.entries()]
    .filter(([normalizedValue]) => normalizedValue.includes(normalizedQuery))
    .sort(([leftValue], [rightValue]) => leftValue.localeCompare(rightValue))
    .slice(0, MAX_SUGGESTION_COUNT)
    .map(([, displayValue]) => displayValue)
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
}
