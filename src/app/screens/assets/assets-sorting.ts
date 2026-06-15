import {
  compareCalendarDatesAscending,
  getInvestmentDerivedValues,
  type DerivedInvestment,
  type Investment,
} from "@/domain/investments"

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
  const asOfDate = new Date()

  return [...investments].sort((leftInvestment, rightInvestment) => {
    const leftDerivedValues = getInvestmentDerivedValues(
      leftInvestment,
      asOfDate,
    )
    const rightDerivedValues = getInvestmentDerivedValues(
      rightInvestment,
      asOfDate,
    )

    switch (sortOption) {
      case ASSET_SORT_OPTIONS.newest:
        return compareDescending(
          Date.parse(leftInvestment.createdAt),
          Date.parse(rightInvestment.createdAt),
        )
      case ASSET_SORT_OPTIONS.highestAmount:
        return compareDescending(
          leftDerivedValues.originalAmount,
          rightDerivedValues.originalAmount,
        )
      case ASSET_SORT_OPTIONS.highestRate:
        return compareDescending(
          leftDerivedValues.annualRate,
          rightDerivedValues.annualRate,
        )
      case ASSET_SORT_OPTIONS.endDateSoonest:
        return compareEndDateSoonest(leftDerivedValues, rightDerivedValues)
    }
  })
}

function compareDescending(leftValue: number, rightValue: number) {
  return rightValue - leftValue
}

function compareEndDateSoonest(
  leftInvestment: DerivedInvestment,
  rightInvestment: DerivedInvestment,
) {
  if (leftInvestment.type === "open-ended") {
    return 1
  }

  if (rightInvestment.type === "open-ended") {
    return -1
  }

  return compareCalendarDatesAscending(
    leftInvestment.endDate,
    rightInvestment.endDate,
  )
}
