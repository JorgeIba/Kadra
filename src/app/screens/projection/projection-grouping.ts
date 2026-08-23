import type { TFunction } from "i18next"

export const PROJECTION_GROUP_BY_OPTIONS = {
  none: "none",
  institution: "institution",
  type: "type",
} as const

export type ProjectionGroupByOption =
  (typeof PROJECTION_GROUP_BY_OPTIONS)[keyof typeof PROJECTION_GROUP_BY_OPTIONS]

export function getProjectionGroupByOptionLabels(
  t: TFunction,
): Readonly<Record<ProjectionGroupByOption, string>> {
  return {
    [PROJECTION_GROUP_BY_OPTIONS.none]: t("common.grouping.none"),
    [PROJECTION_GROUP_BY_OPTIONS.institution]: t("common.grouping.institution"),
    [PROJECTION_GROUP_BY_OPTIONS.type]: t("common.grouping.type"),
  }
}

export const PROJECTION_GROUP_BY_OPTION_VALUES = [
  PROJECTION_GROUP_BY_OPTIONS.none,
  PROJECTION_GROUP_BY_OPTIONS.institution,
  PROJECTION_GROUP_BY_OPTIONS.type,
] as const satisfies ReadonlyArray<ProjectionGroupByOption>
