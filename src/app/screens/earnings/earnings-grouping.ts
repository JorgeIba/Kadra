import type { TFunction } from "i18next"

export const EARNINGS_GROUP_BY_OPTIONS = {
  none: "none",
  institution: "institution",
  type: "type",
} as const

export type EarningsGroupByOption =
  (typeof EARNINGS_GROUP_BY_OPTIONS)[keyof typeof EARNINGS_GROUP_BY_OPTIONS]

export function getEarningsGroupByOptionLabels(
  t: TFunction,
): Readonly<Record<EarningsGroupByOption, string>> {
  return {
    [EARNINGS_GROUP_BY_OPTIONS.none]: t("common.grouping.none"),
    [EARNINGS_GROUP_BY_OPTIONS.institution]: t("common.grouping.institution"),
    [EARNINGS_GROUP_BY_OPTIONS.type]: t("common.grouping.type"),
  }
}

export const EARNINGS_GROUP_BY_OPTION_VALUES = [
  EARNINGS_GROUP_BY_OPTIONS.none,
  EARNINGS_GROUP_BY_OPTIONS.institution,
  EARNINGS_GROUP_BY_OPTIONS.type,
] as const satisfies ReadonlyArray<EarningsGroupByOption>
