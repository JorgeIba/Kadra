import type { TFunction } from "i18next"

export const ASSET_GROUP_BY_OPTIONS = {
  none: "none",
  institution: "institution",
} as const

export type AssetGroupByOption =
  (typeof ASSET_GROUP_BY_OPTIONS)[keyof typeof ASSET_GROUP_BY_OPTIONS]

export function getAssetGroupByOptionLabels(
  t: TFunction,
): Readonly<Record<AssetGroupByOption, string>> {
  return {
    [ASSET_GROUP_BY_OPTIONS.none]: t("assets.viewOptions.list"),
    [ASSET_GROUP_BY_OPTIONS.institution]: t("assets.viewOptions.institution"),
  }
}

export const ASSET_GROUP_BY_OPTION_VALUES = [
  ASSET_GROUP_BY_OPTIONS.none,
  ASSET_GROUP_BY_OPTIONS.institution,
] as const satisfies ReadonlyArray<AssetGroupByOption>
