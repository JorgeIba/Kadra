import { useState } from "react"
import {
  getInvestmentSummary,
  getPortfolioEstimatedCurrentValue,
  type Investment,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatMxn } from "@/lib/formatters"

interface AssetsScreenProps {
  investments: Investment[]
  onAddInvestment: () => void
  onInvestmentSelect: (investmentId: string) => void
}

export function AssetsScreen({
  investments,
  onAddInvestment,
  onInvestmentSelect,
}: AssetsScreenProps) {
  const [filterOption, setFilterOption] = useState<AssetFilterOption>(
    ASSET_FILTER_OPTIONS.all,
  )
  const [sortOption, setSortOption] = useState<AssetSortOption>(
    ASSET_SORT_OPTIONS.newest,
  )
  const asOfDate = new Date()
  const totalValue = getPortfolioEstimatedCurrentValue(investments, asOfDate)
  const filteredInvestments = getFilteredInvestments(
    investments,
    filterOption,
    asOfDate,
  )
  const sortedInvestments = getSortedInvestments(
    filteredInvestments,
    sortOption,
  )
  const investmentSummaries = sortedInvestments.map((investment) =>
    getInvestmentSummary(investment, asOfDate),
  )

  return (
    <section className="space-y-8">
      <div className="space-y-1">
        <p className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Assets
        </p>
        <h1 className="font-ledger text-3xl font-normal tracking-normal">
          All investments
        </h1>
      </div>

      <div className="rounded-lg bg-secondary/70 px-4 py-4">
        <p className="text-xs text-muted-foreground">Current total value</p>
        <p className="mt-2 font-ledger text-3xl leading-none">
          {formatMxn(totalValue)}
        </p>
      </div>

      {investments.length === 0 ? (
        <EmptyInvestmentsState
          title="Your asset list is empty"
          description="Create an investment to build your local portfolio list."
          actionLabel="Add investment"
          onAction={onAddInvestment}
        />
      ) : (
        <div className="space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">Investment list</h2>
              <span className="text-xs font-medium text-muted-foreground">
                {investmentSummaries.length} shown
              </span>
            </div>

            <div className="grid gap-3 border-y border-border/70 py-3">
              <AssetsSelectControl
                ariaLabel="Filter investments"
                fallbackLabel="Select filter"
                label="Filter"
                labels={ASSET_FILTER_OPTION_LABELS}
                options={ASSET_FILTER_OPTION_VALUES}
                value={filterOption}
                onValueChange={setFilterOption}
              />

              <AssetsSelectControl
                ariaLabel="Sort investments"
                fallbackLabel="Select sort"
                label="Sort by"
                labels={ASSET_SORT_OPTION_LABELS}
                options={ASSET_SORT_OPTION_VALUES}
                value={sortOption}
                onValueChange={setSortOption}
              />
            </div>
          </div>

          {investmentSummaries.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/80 px-4 py-6 text-center text-sm text-muted-foreground">
              No investments match this filter.
            </div>
          ) : (
            <div className="divide-y divide-border/70 border-t border-border/70">
              {investmentSummaries.map((investment) => (
                <InvestmentCard
                  key={investment.id}
                  investment={investment}
                  onSelect={onInvestmentSelect}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

interface AssetsSelectControlProps<TOption extends string> {
  ariaLabel: string
  fallbackLabel: string
  label: string
  labels: Record<TOption, string>
  options: ReadonlyArray<TOption>
  value: TOption
  onValueChange: (value: TOption) => void
}

function AssetsSelectControl<TOption extends string>({
  ariaLabel,
  fallbackLabel,
  label,
  labels,
  onValueChange,
  options,
  value,
}: AssetsSelectControlProps<TOption>) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Select
        value={value}
        onValueChange={(nextValue) => {
          onValueChange(nextValue as TOption)
        }}
      >
        <SelectTrigger className="w-44" aria-label={ariaLabel}>
          <SelectValue>
            {(nextValue: TOption | null) =>
              nextValue === null ? fallbackLabel : labels[nextValue]
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {labels[option]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
