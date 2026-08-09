import type { ResolvedInvestment } from "@/domain/investments"

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

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
}
