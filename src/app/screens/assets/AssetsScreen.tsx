import { useState } from "react"
import { useTranslation } from "react-i18next"
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
  ASSET_SORT_OPTION_VALUES,
  ASSET_SORT_OPTIONS,
  getAssetSortOptionLabels,
  getSortedInvestments,
  type AssetSortOption,
} from "@/app/screens/assets/assets-sorting"
import {
  ASSET_FILTER_OPTION_VALUES,
  ASSET_FILTER_OPTIONS,
  getAssetFilterOptionLabels,
  getFilteredInvestments,
  type AssetFilterOption,
} from "@/app/screens/assets/assets-filtering"
import {
  ASSET_GROUP_BY_OPTION_VALUES,
  ASSET_GROUP_BY_OPTIONS,
  getAssetGroupByOptionLabels,
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
  const { t } = useTranslation()
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
  const filterLabels = getAssetFilterOptionLabels(t)
  const sortLabels = getAssetSortOptionLabels(t)
  const viewLabels = getAssetGroupByOptionLabels(t)
  const shownCountLabel = t("assets.list.count", {
    count: sortedInvestments.length,
  })
  const hasActiveSearch = searchQuery.trim() !== ""
  const hasNoSearchMatches = hasActiveSearch && matchingInvestments.length === 0
  const listTransitionKey = [
    groupByOption,
    sortedInvestments.length === 0 ? "empty" : "populated",
  ].join(":")

  return (
    <section className="space-y-6">
      <ScreenIntro eyebrow={t("assets.eyebrow")} title={t("assets.title")} />

      {investments.length === 0 ? (
        <EmptyInvestmentsState
          title={t("assets.empty.title")}
          description={t("assets.empty.description")}
          actionLabel={t("assets.empty.action")}
          onAction={onAddInvestment}
        />
      ) : (
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-card px-4 py-5 text-card-foreground">
              <div className="space-y-1.5">
                <p className="text-xs leading-none text-muted-foreground">
                  {t("assets.currentValueAcrossActiveInvestments")}
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
                    {t("assets.controls.searchLabel")}
                  </label>
                  <AutocompleteField
                    id="assets-search"
                    className="h-10 border-border/80 bg-background/35 px-3 text-foreground hover:border-primary/25 hover:bg-muted/45 focus-visible:border-primary/35 focus-visible:bg-muted/55 focus-visible:ring-3 focus-visible:ring-primary/20"
                    clearable
                    clearButtonLabel={t("common.actions.clearSearch")}
                    filterSuggestion={null}
                    placeholder={t("assets.searchPlaceholder")}
                    suggestions={matchingSuggestions}
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                </div>

                <div className="grid grid-cols-[0.85fr_1.15fr_0.85fr] gap-2 border-t border-border/70 pt-3">
                  <LabeledSelectControl
                    ariaLabel={t("assets.controls.filterAriaLabel")}
                    fallbackLabel={t("assets.controls.filterFallback")}
                    icon={<Filter className="size-3.5" aria-hidden="true" />}
                    label={t("assets.controls.filter")}
                    options={ASSET_FILTER_OPTION_VALUES}
                    value={filterOption}
                    getOptionLabel={(option) => filterLabels[option]}
                    onValueChange={setFilterOption}
                  />

                  <LabeledSelectControl
                    ariaLabel={t("assets.controls.sortAriaLabel")}
                    fallbackLabel={t("assets.controls.sortFallback")}
                    icon={
                      <ArrowUpDown className="size-3.5" aria-hidden="true" />
                    }
                    label={t("assets.controls.sort")}
                    options={ASSET_SORT_OPTION_VALUES}
                    value={sortOption}
                    getOptionLabel={(option) => sortLabels[option]}
                    onValueChange={setSortOption}
                  />

                  <LabeledSelectControl
                    ariaLabel={t("assets.controls.viewAriaLabel")}
                    fallbackLabel={t("assets.controls.groupFallback")}
                    icon={<Building2 className="size-3.5" aria-hidden="true" />}
                    label={t("assets.controls.view")}
                    options={ASSET_GROUP_BY_OPTION_VALUES}
                    value={groupByOption}
                    getOptionLabel={(option) => viewLabels[option]}
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
                    {t("assets.list.emptySearch")}
                  </p>
                  <Button
                    className="mt-3 h-11"
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                  >
                    {t("common.actions.clearSearch")}
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border/80 px-4 py-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {hasActiveSearch
                      ? t("assets.list.noSearchResultsForFilter")
                      : t("assets.list.emptyFilter")}
                  </p>
                  <Button
                    className="mt-3 h-11"
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() => setFilterOption(ASSET_FILTER_OPTIONS.all)}
                  >
                    {t("assets.list.showAll")}
                  </Button>
                </div>
              )
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold">
                    {t("assets.list.heading")}
                  </h2>
                  <span className="text-xs font-medium text-muted-foreground">
                    {shownCountLabel}
                  </span>
                </div>

                <AssetsInvestmentList
                  activeValueLabel={t("assets.activeValue")}
                  groupByOption={groupByOption}
                  investments={sortedInvestments}
                  onInvestmentSelect={onInvestmentSelect}
                  itemCountLabel={(count) =>
                    t("common.counts.investment", { count })
                  }
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
  activeValueLabel,
  groupByOption,
  itemCountLabel,
  investments,
  onInvestmentSelect,
}: {
  activeValueLabel: string
  groupByOption: AssetGroupByOption
  itemCountLabel: (count: number) => string
  investments: ResolvedInvestment[]
  onInvestmentSelect: (investmentId: string) => void
}) {
  const prefersReducedMotion = useReducedMotion() ?? false

  if (groupByOption === ASSET_GROUP_BY_OPTIONS.institution) {
    return (
      <AssetInstitutionGroups
        activeValueLabel={activeValueLabel}
        itemCountLabel={itemCountLabel}
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
  activeValueLabel,
  itemCountLabel,
  investments,
  onInvestmentSelect,
}: {
  activeValueLabel: string
  itemCountLabel: (count: number) => string
  investments: ResolvedInvestment[]
  onInvestmentSelect: (investmentId: string) => void
}) {
  const { t } = useTranslation()
  const groups = createGroups(investments, {
    getGroup: (investment) =>
      getInstitutionGroup(
        investment.institutionName,
        t("common.grouping.unknownInstitution"),
      ),
    metric: {
      key: "activeValue",
      label: activeValueLabel,
      getValue: getInvestmentEstimatedActiveCurrentValue,
    },
  })

  return (
    <GroupedMetricList
      groups={groups}
      itemListClassName="divide-y divide-border/70 px-2 py-1"
      itemCountLabel={itemCountLabel}
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
