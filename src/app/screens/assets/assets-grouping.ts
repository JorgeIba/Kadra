export const ASSET_GROUP_BY_OPTIONS = {
  none: "none",
  institution: "institution",
} as const

export type AssetGroupByOption =
  (typeof ASSET_GROUP_BY_OPTIONS)[keyof typeof ASSET_GROUP_BY_OPTIONS]

export const ASSET_GROUP_BY_LABELS = {
  [ASSET_GROUP_BY_OPTIONS.none]: "None",
  [ASSET_GROUP_BY_OPTIONS.institution]: "Institution",
} as const satisfies Record<AssetGroupByOption, string>

export const ASSET_GROUP_BY_OPTION_VALUES = [
  ASSET_GROUP_BY_OPTIONS.none,
  ASSET_GROUP_BY_OPTIONS.institution,
] as const satisfies ReadonlyArray<AssetGroupByOption>
