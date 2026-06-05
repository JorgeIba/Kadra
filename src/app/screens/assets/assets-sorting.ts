import { INVESTMENT_TYPES, type Investment } from "@/domain/investments"

export const ASSET_SORT_OPTIONS = {
  newest: "newest",
  highestAmount: "highest-amount",
  highestRate: "highest-rate",
  endDateSoonest: "end-date-soonest",
} as const

export type AssetSortOption =
  (typeof ASSET_SORT_OPTIONS)[keyof typeof ASSET_SORT_OPTIONS]

export const ASSET_SORT_OPTION_LABELS = {
  [ASSET_SORT_OPTIONS.newest]: "Newest first",
  [ASSET_SORT_OPTIONS.highestAmount]: "Highest amount",
  [ASSET_SORT_OPTIONS.highestRate]: "Highest rate",
  [ASSET_SORT_OPTIONS.endDateSoonest]: "End date soonest",
} as const satisfies Record<AssetSortOption, string>

export const ASSET_SORT_OPTION_VALUES = [
  ASSET_SORT_OPTIONS.newest,
  ASSET_SORT_OPTIONS.highestAmount,
  ASSET_SORT_OPTIONS.highestRate,
  ASSET_SORT_OPTIONS.endDateSoonest,
] as const satisfies ReadonlyArray<AssetSortOption>

export function getSortedInvestments(
  investments: Investment[],
  sortOption: AssetSortOption,
) {
  return [...investments].sort((leftInvestment, rightInvestment) => {
    switch (sortOption) {
      case ASSET_SORT_OPTIONS.newest:
        return compareDescending(
          Date.parse(leftInvestment.createdAt),
          Date.parse(rightInvestment.createdAt),
        )
      case ASSET_SORT_OPTIONS.highestAmount:
        return compareDescending(
          leftInvestment.originalAmount,
          rightInvestment.originalAmount,
        )
      case ASSET_SORT_OPTIONS.highestRate:
        return compareDescending(
          leftInvestment.annualRate,
          rightInvestment.annualRate,
        )
      case ASSET_SORT_OPTIONS.endDateSoonest:
        return compareEndDateSoonest(leftInvestment, rightInvestment)
    }
  })
}

function compareDescending(leftValue: number, rightValue: number) {
  return rightValue - leftValue
}

function compareEndDateSoonest(
  leftInvestment: Investment,
  rightInvestment: Investment,
) {
  const leftEndDate = getSortableEndDate(leftInvestment)
  const rightEndDate = getSortableEndDate(rightInvestment)

  return leftEndDate - rightEndDate
}

function getSortableEndDate(investment: Investment) {
  if (investment.type === INVESTMENT_TYPES.openEnded) {
    return Number.POSITIVE_INFINITY
  }

  return Date.parse(investment.endDate)
}
