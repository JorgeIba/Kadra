import { useState } from "react"
import { ArrowUpDown, Building2, Filter } from "lucide-react"
import { AnimatedListSurface } from "@/app/components/AnimatedListSurface"
import { GroupedMetricList } from "@/app/components/GroupedMetricList"
import { LabeledSelectControl } from "@/app/components/LabeledSelectControl"
import { MoneyAmount } from "@/app/components/MoneyAmount"
import { ScreenIntro } from "@/app/components/ScreenIntro"
import {
  getInvestmentEstimatedActiveCurrentValue,
  getPortfolioEstimatedCurrentValue,
  getResolvedInvestmentSummary,
  resolveInvestment,
  type Investment,
  type ResolvedInvestment,
} from "@/domain/investments"
import { EmptyInvestmentsState } from "@/app/components/investments/EmptyInvestmentsState"
import { InvestmentCard } from "@/app/components/investments/InvestmentCard"
import {
  ASSET_SORT_OPTION_LABELS,
  ASSET_SORT_OPTION_VALUES,
  ASSET_SORT_OPTIONS,
  getSortedInvestments,
  type AssetSortOption,
} from "@/app/screens/assets/assets-sorting"
import {
  ASSET_FILTER_OPTION_LABELS,
  ASSET_FILTER_OPTION_VALUES,
  ASSET_FILTER_OPTIONS,
  getFilteredInvestments,
  type AssetFilterOption,
} from "@/app/screens/assets/assets-filtering"
import {
  ASSET_GROUP_BY_LABELS,
  ASSET_GROUP_BY_OPTION_VALUES,
  ASSET_GROUP_BY_OPTIONS,
  type AssetGroupByOption,
} from "@/app/screens/assets/assets-grouping"
import { createGroups } from "@/app/shared/grouping"
import { getInstitutionGroup } from "@/app/shared/institution-grouping"

interface AssetsScreenProps {
  initialFilterOption?: AssetFilterOption
  investments: Investment[]
  onAddInvestment: () => void
  onInvestmentSelect: (investmentId: string) => void
}

export function AssetsScreen({
  initialFilterOption,
  investments,
  onAddInvestment,
  onInvestmentSelect,
}: AssetsScreenProps) {
  const [filterOption, setFilterOption] = useState<AssetFilterOption>(
    initialFilterOption ?? ASSET_FILTER_OPTIONS.all,
  )
  const [sortOption, setSortOption] = useState<AssetSortOption>(
    ASSET_SORT_OPTIONS.newest,
  )
  const [groupByOption, setGroupByOption] = useState<AssetGroupByOption>(
    ASSET_GROUP_BY_OPTIONS.none,
  )
  const asOfDate = new Date()
  const resolvedInvestments = investments.map((investment) =>
    resolveInvestment(investment, asOfDate),
  )
  const totalValue = getPortfolioEstimatedCurrentValue(resolvedInvestments)
  const filteredInvestments = getFilteredInvestments(
    resolvedInvestments,
    filterOption,
  )
  const sortedInvestments = getSortedInvestments(
    filteredInvestments,
    sortOption,
  )
  const shownCountLabel = `${sortedInvestments.length} shown`
  const listTransitionKey = [
    filterOption,
    sortOption,
    groupByOption,
    sortedInvestments.length,
  ].join(":")

  return (
    <section className="space-y-6">
      <ScreenIntro eyebrow="Assets" title="All investments" />

      {investments.length === 0 ? (
        <EmptyInvestmentsState
          title="Your asset list is empty"
          description="Create an investment to build your local portfolio list."
          actionLabel="Add investment"
          onAction={onAddInvestment}
        />
      ) : (
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-card px-4 py-5 text-card-foreground">
              <div className="space-y-1.5">
                <p className="text-xs leading-none text-muted-foreground">
                  Current value across active investments
                </p>
                <p className="font-ledger text-4xl leading-none tabular-nums">
                  <MoneyAmount value={totalValue} />
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border/70 bg-card/45 p-3">
              <div className="grid grid-cols-[0.85fr_1.15fr_0.85fr] gap-2">
                <LabeledSelectControl
                  ariaLabel="Filter investments"
                  fallbackLabel="Select filter"
                  icon={<Filter className="size-3.5" aria-hidden="true" />}
                  label="Filter"
                  options={ASSET_FILTER_OPTION_VALUES}
                  value={filterOption}
                  getOptionLabel={(option) =>
                    ASSET_FILTER_OPTION_LABELS[option]
                  }
                  onValueChange={setFilterOption}
                />

                <LabeledSelectControl
                  ariaLabel="Sort investments"
                  fallbackLabel="Select sort"
                  icon={<ArrowUpDown className="size-3.5" aria-hidden="true" />}
                  label="Sort"
                  options={ASSET_SORT_OPTION_VALUES}
                  value={sortOption}
                  getOptionLabel={(option) => ASSET_SORT_OPTION_LABELS[option]}
                  onValueChange={setSortOption}
                />

                <LabeledSelectControl
                  ariaLabel="Change asset list view"
                  fallbackLabel="Select view"
                  icon={<Building2 className="size-3.5" aria-hidden="true" />}
                  label="View"
                  options={ASSET_GROUP_BY_OPTION_VALUES}
                  value={groupByOption}
                  getOptionLabel={(option) => ASSET_GROUP_BY_LABELS[option]}
                  onValueChange={setGroupByOption}
                />
              </div>
            </div>
          </div>

          <AnimatedListSurface transitionKey={listTransitionKey}>
            {sortedInvestments.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/80 px-4 py-6 text-center text-sm text-muted-foreground">
                No investments match this filter.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold">Investment list</h2>
                  <span className="text-xs font-medium text-muted-foreground">
                    {shownCountLabel}
                  </span>
                </div>

                <AssetsInvestmentList
                  groupByOption={groupByOption}
                  investments={sortedInvestments}
                  onInvestmentSelect={onInvestmentSelect}
                />
              </div>
            )}
          </AnimatedListSurface>
        </div>
      )}
    </section>
  )
}

function AssetsInvestmentList({
  groupByOption,
  investments,
  onInvestmentSelect,
}: {
  groupByOption: AssetGroupByOption
  investments: ResolvedInvestment[]
  onInvestmentSelect: (investmentId: string) => void
}) {
  if (groupByOption === ASSET_GROUP_BY_OPTIONS.institution) {
    return (
      <AssetInstitutionGroups
        investments={investments}
        onInvestmentSelect={onInvestmentSelect}
      />
    )
  }

  return (
    <div className="divide-y divide-border/70 border-t border-border/70">
      {investments.map((investment) => (
        <InvestmentCard
          key={investment.id}
          investment={getResolvedInvestmentSummary(investment)}
          onSelect={onInvestmentSelect}
        />
      ))}
    </div>
  )
}

function AssetInstitutionGroups({
  investments,
  onInvestmentSelect,
}: {
  investments: ResolvedInvestment[]
  onInvestmentSelect: (investmentId: string) => void
}) {
  const groups = createGroups(investments, {
    getGroup: (investment) => getInstitutionGroup(investment.institutionName),
    metric: {
      key: "activeValue",
      label: "Active value",
      getValue: getInvestmentEstimatedActiveCurrentValue,
    },
  })

  return (
    <GroupedMetricList
      groups={groups}
      itemListClassName="divide-y divide-border/70 px-2 py-1"
      itemNoun="investment"
      renderMetric={(value) => <MoneyAmount value={value} />}
      renderItem={(item) => (
        <InvestmentCard
          key={item.source.id}
          density="relaxed"
          investment={getResolvedInvestmentSummary(item.source)}
          onSelect={onInvestmentSelect}
        />
      )}
    />
  )
}
