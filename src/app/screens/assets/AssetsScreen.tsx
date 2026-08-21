import { useState } from "react"
import { ArrowUpDown, Building2, Filter, Search } from "lucide-react"
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react"
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
import { AutocompleteField } from "@/components/ui/autocomplete-field"
import { Button } from "@/components/ui/button"
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
import {
  getAssetSuggestionsMatchingQuery,
  getInvestmentsMatchingQuery,
} from "@/app/shared/investment-search"
import { createGroups } from "@/app/shared/grouping"
import { getInstitutionGroup } from "@/app/shared/institution-grouping"

const ASSETS_LIST_LAYOUT_TRANSITION = {
  duration: 0.24,
  ease: [0.22, 1, 0.36, 1],
} as const

const ASSETS_LIST_EXIT_TRANSITION = {
  duration: 0.14,
  ease: [0.22, 1, 0.36, 1],
} as const

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
  const [searchQuery, setSearchQuery] = useState("")
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
  const matchingInvestments = getInvestmentsMatchingQuery(
    resolvedInvestments,
    searchQuery,
  )
  const matchingSuggestions = getAssetSuggestionsMatchingQuery(
    investments,
    searchQuery,
  )
  const filteredInvestments = getFilteredInvestments(
    matchingInvestments,
    filterOption,
  )
  const sortedInvestments = getSortedInvestments(
    filteredInvestments,
    sortOption,
  )
  const shownCountLabel = `${sortedInvestments.length} shown`
  const hasActiveSearch = searchQuery.trim() !== ""
  const hasNoSearchMatches = hasActiveSearch && matchingInvestments.length === 0
  const listTransitionKey = [
    groupByOption,
    sortedInvestments.length === 0 ? "empty" : "populated",
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
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label
                    className="flex items-center gap-1.5 text-[0.68rem] leading-[1.35] font-medium tracking-[0.14em] text-muted-foreground uppercase"
                    htmlFor="assets-search"
                  >
                    <span className="grid size-3.5 shrink-0 place-items-center text-muted-foreground">
                      <Search className="size-3.5" aria-hidden="true" />
                    </span>
                    Search
                  </label>
                  <AutocompleteField
                    id="assets-search"
                    className="h-10 border-border/80 bg-background/35 px-3 text-foreground hover:border-primary/25 hover:bg-muted/45 focus-visible:border-primary/35 focus-visible:bg-muted/55 focus-visible:ring-3 focus-visible:ring-primary/20"
                    clearable
                    clearButtonLabel="Clear search"
                    filterSuggestion={null}
                    placeholder="Name, institution, or notes"
                    suggestions={matchingSuggestions}
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                </div>

                <div className="grid grid-cols-[0.85fr_1.15fr_0.85fr] gap-2 border-t border-border/70 pt-3">
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
                    icon={
                      <ArrowUpDown className="size-3.5" aria-hidden="true" />
                    }
                    label="Sort"
                    options={ASSET_SORT_OPTION_VALUES}
                    value={sortOption}
                    getOptionLabel={(option) =>
                      ASSET_SORT_OPTION_LABELS[option]
                    }
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
          </div>

          <AnimatedListSurface transitionKey={listTransitionKey}>
            {sortedInvestments.length === 0 ? (
              hasNoSearchMatches ? (
                <div className="rounded-lg border border-dashed border-border/80 px-4 py-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No investments match your search.
                  </p>
                  <Button
                    className="mt-3 h-11"
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear search
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border/80 px-4 py-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {hasActiveSearch
                      ? "No search results match this filter."
                      : "No investments match this filter."}
                  </p>
                  <Button
                    className="mt-3 h-11"
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() => setFilterOption(ASSET_FILTER_OPTIONS.all)}
                  >
                    Show all
                  </Button>
                </div>
              )
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
  const prefersReducedMotion = useReducedMotion() ?? false

  if (groupByOption === ASSET_GROUP_BY_OPTIONS.institution) {
    return (
      <AssetInstitutionGroups
        investments={investments}
        onInvestmentSelect={onInvestmentSelect}
      />
    )
  }

  const listTransition = prefersReducedMotion
    ? { duration: 0 }
    : {
        layout: ASSETS_LIST_LAYOUT_TRANSITION,
        opacity: ASSETS_LIST_EXIT_TRANSITION,
      }

  return (
    <LayoutGroup id="assets-investment-list-layout">
      <div className="divide-y divide-border/70 border-t border-border/70">
        <AnimatePresence initial={false} mode="popLayout">
          {investments.map((investment) => (
            <motion.div
              key={investment.id}
              className="assets-list-item"
              initial={false}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0 }}
              layout={prefersReducedMotion ? false : "position"}
              transition={listTransition}
            >
              <InvestmentCard
                investment={getResolvedInvestmentSummary(investment)}
                onSelect={onInvestmentSelect}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </LayoutGroup>
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
