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
    <section className="space-y-5">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Assets</p>
        <h1 className="text-3xl font-semibold tracking-normal">
          All investments
        </h1>
      </div>

      <div className="rounded-lg border bg-card px-4 py-3 text-card-foreground">
        <p className="text-sm text-muted-foreground">Current total value</p>
        <p className="mt-1 text-2xl font-semibold">{formatMxn(totalValue)}</p>
      </div>

      {investments.length === 0 ? (
        <EmptyInvestmentsState
          title="Your asset list is empty"
          description="Create an investment to build your local portfolio list."
          actionLabel="Add investment"
          onAction={onAddInvestment}
        />
      ) : (
        <div className="space-y-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Investment list</h2>
              <span className="text-sm font-medium text-muted-foreground">
                {investmentSummaries.length} shown
              </span>
            </div>

            <div className="grid gap-2 rounded-lg border bg-card px-3 py-3 text-card-foreground">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Filter
                </span>
                <Select
                  value={filterOption}
                  onValueChange={(value) => {
                    setFilterOption(value as AssetFilterOption)
                  }}
                >
                  <SelectTrigger
                    className="w-44"
                    aria-label="Filter investments"
                  >
                    <SelectValue>
                      {(value: AssetFilterOption | null) =>
                        value === null
                          ? "Select filter"
                          : ASSET_FILTER_OPTION_LABELS[value]
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_FILTER_OPTION_VALUES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {ASSET_FILTER_OPTION_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Sort by
                </span>
                <Select
                  value={sortOption}
                  onValueChange={(value) => {
                    setSortOption(value as AssetSortOption)
                  }}
                >
                  <SelectTrigger className="w-44" aria-label="Sort investments">
                    <SelectValue>
                      {(value: AssetSortOption | null) =>
                        value === null
                          ? "Select sort"
                          : ASSET_SORT_OPTION_LABELS[value]
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_SORT_OPTION_VALUES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {ASSET_SORT_OPTION_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {investmentSummaries.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-card px-4 py-6 text-center text-sm text-muted-foreground">
              No investments match this filter.
            </div>
          ) : (
            <div className="space-y-3">
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
