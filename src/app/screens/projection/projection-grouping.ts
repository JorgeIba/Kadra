export const PROJECTION_GROUP_BY_OPTIONS = {
  none: "none",
  institution: "institution",
} as const

export type ProjectionGroupByOption =
  (typeof PROJECTION_GROUP_BY_OPTIONS)[keyof typeof PROJECTION_GROUP_BY_OPTIONS]

export const PROJECTION_GROUP_BY_LABELS = {
  [PROJECTION_GROUP_BY_OPTIONS.none]: "None",
  [PROJECTION_GROUP_BY_OPTIONS.institution]: "Institution",
} as const satisfies Record<ProjectionGroupByOption, string>

export const PROJECTION_GROUP_BY_OPTION_VALUES = [
  PROJECTION_GROUP_BY_OPTIONS.none,
  PROJECTION_GROUP_BY_OPTIONS.institution,
] as const satisfies ReadonlyArray<ProjectionGroupByOption>
