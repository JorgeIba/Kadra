export const EARNINGS_GROUP_BY_OPTIONS = {
  none: "none",
  institution: "institution",
} as const

export type EarningsGroupByOption =
  (typeof EARNINGS_GROUP_BY_OPTIONS)[keyof typeof EARNINGS_GROUP_BY_OPTIONS]

export const EARNINGS_GROUP_BY_LABELS = {
  [EARNINGS_GROUP_BY_OPTIONS.none]: "None",
  [EARNINGS_GROUP_BY_OPTIONS.institution]: "Institution",
} as const satisfies Record<EarningsGroupByOption, string>

export const EARNINGS_GROUP_BY_OPTION_VALUES = [
  EARNINGS_GROUP_BY_OPTIONS.none,
  EARNINGS_GROUP_BY_OPTIONS.institution,
] as const satisfies ReadonlyArray<EarningsGroupByOption>
