export interface GroupIdentity {
  // key is the stable grouping value; label is what the UI should display.
  // They can differ later if a grouping mode needs normalized keys.
  key: string
  label: string
}

export interface GroupMetricConfig<TSource> {
  key: string
  label: string
  // Extracts the numeric contribution each source item makes to its group.
  getValue: (source: TSource) => number
  // Optional screen-level denominator used to calculate the group share.
  totalValue?: number
}

export interface GroupTotalMetric {
  key: string
  label: string
  value: number
  // Percentage of the whole screen total, for example Klar / all earned return.
  shareOfTotal?: number
}

export interface ItemContributionMetric {
  key: string
  label: string
  value: number
  // Percentage within this group, for example one Klar investment / all Klar.
  shareOfGroup?: number
}

export interface BreakdownItem<TSource> {
  // Keep the original row model so screen adapters can render their normal row UI.
  source: TSource
  contributionMetric: ItemContributionMetric
}

export interface BreakdownGroup<TSource> {
  key: string
  label: string
  totalMetric: GroupTotalMetric
  items: BreakdownItem<TSource>[]
}

interface CreateGroupsConfig<TSource> {
  getGroup: (source: TSource) => GroupIdentity
  metric: GroupMetricConfig<TSource>
}

export function createGroups<TSource>(
  sources: TSource[],
  config: CreateGroupsConfig<TSource>,
): BreakdownGroup<TSource>[] {
  const groups = new Map<string, BreakdownGroup<TSource>>()

  // Sources should already be filtered and sorted by the caller. Map insertion
  // order preserves that sort for both groups and items inside each group.
  sources.forEach((source) => {
    const groupIdentity = config.getGroup(source)
    const group = getOrInsertGroup(groups, groupIdentity, config.metric)
    const item = createBreakdownItem(source, config.metric)

    group.items.push(item)
    group.totalMetric.value += item.contributionMetric.value
  })

  return [...groups.values()].map((group) => {
    return addMetricShares(group, config.metric)
  })
}

function getOrInsertGroup<TSource>(
  groups: Map<string, BreakdownGroup<TSource>>,
  groupIdentity: GroupIdentity,
  metricConfig: GroupMetricConfig<TSource>,
) {
  const existingGroup = groups.get(groupIdentity.key)

  if (existingGroup !== undefined) {
    return existingGroup
  }

  const group = {
    key: groupIdentity.key,
    label: groupIdentity.label,
    totalMetric: {
      key: metricConfig.key,
      label: metricConfig.label,
      value: 0,
      shareOfTotal: undefined,
    },
    items: [],
  } satisfies BreakdownGroup<TSource>

  groups.set(group.key, group)

  return group
}

function createBreakdownItem<TSource>(
  source: TSource,
  metricConfig: GroupMetricConfig<TSource>,
): BreakdownItem<TSource> {
  return {
    source,
    contributionMetric: {
      key: metricConfig.key,
      label: metricConfig.label,
      value: metricConfig.getValue(source),
      shareOfGroup: undefined,
    },
  }
}

function addMetricShares<TSource>(
  group: BreakdownGroup<TSource>,
  metricConfig: GroupMetricConfig<TSource>,
): BreakdownGroup<TSource> {
  // Calculate percentages after totals are complete so each item can compare
  // against its final group total.
  const totalMetric = {
    ...group.totalMetric,
    shareOfTotal:
      metricConfig.totalValue === undefined
        ? undefined
        : getPercentage(group.totalMetric.value, metricConfig.totalValue),
  }

  return {
    ...group,
    totalMetric,
    items: group.items.map((item) => {
      return {
        ...item,
        contributionMetric: {
          ...item.contributionMetric,
          shareOfGroup: getPercentage(
            item.contributionMetric.value,
            group.totalMetric.value,
          ),
        },
      }
    }),
  }
}

function getPercentage(value: number, totalValue: number) {
  if (totalValue === 0) {
    return 0
  }

  return (value / totalValue) * 100
}
