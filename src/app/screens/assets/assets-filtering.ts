import {
  DERIVED_STATUSES,
  INVESTMENT_TYPES,
  type ResolvedInvestment,
} from "@/domain/investments"

export const ASSET_FILTER_OPTIONS = {
  all: "all",
  fixedTerm: "fixed-term",
  openEnded: "open-ended",
  active: "active",
  finished: "finished",
} as const

export type AssetFilterOption =
  (typeof ASSET_FILTER_OPTIONS)[keyof typeof ASSET_FILTER_OPTIONS]

export const ASSET_FILTER_OPTION_LABELS = {
  [ASSET_FILTER_OPTIONS.all]: "All",
  [ASSET_FILTER_OPTIONS.fixedTerm]: "Fixed term",
  [ASSET_FILTER_OPTIONS.openEnded]: "Open ended",
  [ASSET_FILTER_OPTIONS.active]: "Active",
  [ASSET_FILTER_OPTIONS.finished]: "Finished",
} as const satisfies Record<AssetFilterOption, string>

export const ASSET_FILTER_OPTION_VALUES = [
  ASSET_FILTER_OPTIONS.all,
  ASSET_FILTER_OPTIONS.fixedTerm,
  ASSET_FILTER_OPTIONS.openEnded,
  ASSET_FILTER_OPTIONS.active,
  ASSET_FILTER_OPTIONS.finished,
] as const satisfies ReadonlyArray<AssetFilterOption>

export function getFilteredInvestments(
  investments: ResolvedInvestment[],
  filterOption: AssetFilterOption,
) {
  return investments.filter((investment) => {
    switch (filterOption) {
      case ASSET_FILTER_OPTIONS.all:
        return true
      case ASSET_FILTER_OPTIONS.fixedTerm:
        return investment.type === INVESTMENT_TYPES.fixedTerm
      case ASSET_FILTER_OPTIONS.openEnded:
        return investment.type === INVESTMENT_TYPES.openEnded
      case ASSET_FILTER_OPTIONS.active:
        return investment.derivedStatus === DERIVED_STATUSES.active
      case ASSET_FILTER_OPTIONS.finished:
        return investment.derivedStatus === DERIVED_STATUSES.finished
    }
  })
}
