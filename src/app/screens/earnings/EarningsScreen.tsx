import { useState } from "react"
import { ArrowUpDown, Building2 } from "lucide-react"
import { AnimatedListSurface } from "@/app/components/AnimatedListSurface"
import { GroupedMetricList } from "@/app/components/GroupedMetricList"
import { LabeledSelectControl } from "@/app/components/LabeledSelectControl"
import { MoneyAmount } from "@/app/components/MoneyAmount"
import { TrustNotesPopover } from "@/app/components/TrustNotes"
import {
  DERIVED_STATUSES,
  DERIVED_STATUS_LABELS,
  type DerivedStatus,
  type Investment,
} from "@/domain/investments"
import { AnimatedProgressBar } from "@/app/components/AnimatedProgressBar"
import {
  EARNINGS_GROUP_BY_LABELS,
  EARNINGS_GROUP_BY_OPTION_VALUES,
  EARNINGS_GROUP_BY_OPTIONS,
  type EarningsGroupByOption,
} from "@/app/screens/earnings/earnings-grouping"
import {
  EARNED_MONEY_SORT_OPTIONS,
  getEarnedMoneySortLabel,
  getPortfolioEarnedMoneySnapshot,
  type EarnedMoneySortOption,
  type InvestmentEarnedMoneyBreakdown,
  type InvestmentEarnedMoneyBreakdownItem,
} from "@/app/screens/earnings/earnings-view-model"
import { createGroups, type GroupIdentity } from "@/app/shared/grouping"
import { getInstitutionGroup } from "@/app/shared/institution-grouping"
import { getInvestmentTypeGroup } from "@/app/shared/investment-type-grouping"
import { formatPercentage } from "@/lib/formatters"
import { cn } from "@/lib/utils"

interface EarningsScreenProps {
  investments: Investment[]
  onInvestmentSelect: (investmentId: string) => void
}

const EARNED_MONEY_SORT_CHOICES = [
  EARNED_MONEY_SORT_OPTIONS.highestEarned,
  EARNED_MONEY_SORT_OPTIONS.lowestEarned,
  EARNED_MONEY_SORT_OPTIONS.name,
  EARNED_MONEY_SORT_OPTIONS.status,
] as const satisfies ReadonlyArray<EarnedMoneySortOption>

const EARNINGS_TRUST_NOTES = [
  "Estimated from the investments saved on this device.",
  "Historical total includes active and finished investments.",
]

export function EarningsScreen({
  investments,
  onInvestmentSelect,
}: EarningsScreenProps) {
  const [sortBy, setSortBy] = useState<EarnedMoneySortOption>(
    EARNED_MONEY_SORT_OPTIONS.highestEarned,
  )
  const [groupByOption, setGroupByOption] = useState<EarningsGroupByOption>(
    EARNINGS_GROUP_BY_OPTIONS.none,
  )
  const snapshot = getPortfolioEarnedMoneySnapshot(
    investments,
    new Date(),
    sortBy,
  )
  const breakdownTransitionKey = [
    sortBy,
    groupByOption,
    snapshot.breakdown.length,
  ].join(":")

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Dashboard report
        </p>
        <h1 className="text-balance font-ledger text-3xl font-normal tracking-normal text-foreground">
          Return earned by the portfolio.
        </h1>
      </div>

      <div className="space-y-6">
        <section className="overflow-hidden border-y border-border/70">
          <div className="py-5">
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">
                Total earned return
              </p>
              <p className="font-ledger text-4xl leading-none text-foreground tabular-nums">
                <MoneyAmount value={snapshot.totalEarnedAmount} />
              </p>
              <div className="flex items-center gap-2">
                <p className="text-pretty text-sm leading-6 text-muted-foreground">
                  Estimated return produced through today.
                </p>
                <TrustNotesPopover
                  label="Earned return notes"
                  notes={EARNINGS_TRUST_NOTES}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 border-t border-border/70 bg-background/20">
            <SummaryMetric
              label="Investments"
              value={String(snapshot.investmentCount)}
            />
            <SummaryMetric
              label="Active"
              value={String(snapshot.activeInvestmentCount)}
            />
            <SummaryMetric
              label="Finished"
              value={String(snapshot.finishedInvestmentCount)}
            />
          </div>
        </section>

        <section className="space-y-6 border-t border-border/70 pt-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-balance text-base font-bold leading-tight text-foreground">
                Breakdown by investment
              </h2>
            </div>

            <div className="grid w-full min-w-0 grid-cols-2 gap-2 rounded-lg border border-border/70 bg-card/45 p-2.5 sm:w-auto sm:min-w-96">
              <LabeledSelectControl
                ariaLabel="Sort earned return breakdown"
                fallbackLabel="Select sort"
                icon={<ArrowUpDown className="size-3.5" aria-hidden="true" />}
                label="Sort by"
                options={EARNED_MONEY_SORT_CHOICES}
                value={sortBy}
                getOptionLabel={getEarnedMoneySortLabel}
                onValueChange={setSortBy}
              />

              <LabeledSelectControl
                ariaLabel="Group investments"
                fallbackLabel="Select grouping"
                icon={<Building2 className="size-3.5" aria-hidden="true" />}
                label="Group by"
                options={EARNINGS_GROUP_BY_OPTION_VALUES}
                value={groupByOption}
                getOptionLabel={(option) => EARNINGS_GROUP_BY_LABELS[option]}
                onValueChange={setGroupByOption}
              />
            </div>
          </div>

          <AnimatedListSurface transitionKey={breakdownTransitionKey}>
            <EarningsBreakdownList
              breakdown={snapshot.breakdown}
              groupByOption={groupByOption}
              onInvestmentSelect={onInvestmentSelect}
              totalEarnedAmount={snapshot.totalEarnedAmount}
            />
          </AnimatedListSurface>
        </section>
      </div>
    </section>
  )
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-border/70 px-3 py-3 last:border-r-0">
      <p className="text-xs leading-none text-muted-foreground">{label}</p>
      <p className="mt-2 font-ledger text-lg leading-none text-foreground tabular-nums">
        {value}
      </p>
    </div>
  )
}

function EarningsBreakdownList({
  breakdown,
  groupByOption,
  onInvestmentSelect,
  totalEarnedAmount,
}: {
  breakdown: InvestmentEarnedMoneyBreakdown
  groupByOption: EarningsGroupByOption
  onInvestmentSelect: (investmentId: string) => void
  totalEarnedAmount: number
}) {
  if (breakdown.length === 0) {
    return (
      <p className="text-pretty text-sm leading-6 text-muted-foreground">
        Add investments to start tracking earned return.
      </p>
    )
  }

  if (groupByOption === EARNINGS_GROUP_BY_OPTIONS.institution) {
    return (
      <EarningsBreakdownGroups
        breakdown={breakdown}
        getGroup={(investment) =>
          getInstitutionGroup(investment.institutionName)
        }
        onInvestmentSelect={onInvestmentSelect}
        totalEarnedAmount={totalEarnedAmount}
      />
    )
  }

  if (groupByOption === EARNINGS_GROUP_BY_OPTIONS.type) {
    return (
      <EarningsBreakdownGroups
        breakdown={breakdown}
        getGroup={(investment) => getInvestmentTypeGroup(investment.type)}
        onInvestmentSelect={onInvestmentSelect}
        totalEarnedAmount={totalEarnedAmount}
      />
    )
  }

  return (
    <div className="space-y-5">
      {breakdown.map((investment) => (
        <EarningsBreakdownRow
          key={investment.investmentId}
          investment={investment}
          onSelect={onInvestmentSelect}
        />
      ))}
    </div>
  )
}

function EarningsBreakdownGroups({
  breakdown,
  getGroup,
  onInvestmentSelect,
  totalEarnedAmount,
}: {
  breakdown: InvestmentEarnedMoneyBreakdown
  getGroup: (investment: InvestmentEarnedMoneyBreakdownItem) => GroupIdentity
  onInvestmentSelect: (investmentId: string) => void
  totalEarnedAmount: number
}) {
  const groups = createGroups(breakdown, {
    getGroup,
    metric: {
      key: "earned",
      label: "Earned",
      getValue: (investment) => investment.earnedAmount,
      totalValue: totalEarnedAmount,
    },
  })

  return (
    <GroupedMetricList
      groups={groups}
      itemListClassName="divide-y divide-border/60 p-0"
      itemNoun="investment"
      renderMetric={(value) => <MoneyAmount value={value} />}
      showShareOfTotal
      renderItem={(item) => (
        <EarningsBreakdownRow
          key={item.source.investmentId}
          investment={item.source}
          percentage={item.contributionMetric.shareOfGroup}
          onSelect={onInvestmentSelect}
        />
      )}
    />
  )
}

function EarningsBreakdownRow({
  investment,
  onSelect,
  percentage,
}: {
  investment: InvestmentEarnedMoneyBreakdownItem
  onSelect: (investmentId: string) => void
  percentage?: number
}) {
  const displayedPercentage = percentage ?? investment.percentage

  return (
    <button
      type="button"
      className="block w-full space-y-3 rounded-lg border border-transparent px-3 py-4 text-left transition-[transform,color,background-color,border-color] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:border-primary/10 hover:bg-secondary/45 hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:translate-y-px active:border-primary/10 active:bg-secondary/60 motion-reduce:transform-none motion-reduce:transition-none"
      onClick={() => onSelect(investment.investmentId)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-ledger text-base text-foreground">
              {investment.name}
            </p>
            <span
              className={cn(
                "rounded-full border px-2 py-1 text-[0.68rem] font-medium",
                getStatusBadgeClassName(investment.derivedStatus),
              )}
            >
              {DERIVED_STATUS_LABELS[investment.derivedStatus]}
            </span>
          </div>
          <p className="mt-2 truncate text-xs text-muted-foreground">
            {investment.institutionName}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-ledger text-sm font-bold text-foreground tabular-nums">
            <MoneyAmount value={investment.earnedAmount} />
          </p>
          <p className="text-xs text-muted-foreground">
            {formatPercentage(displayedPercentage)}
          </p>
        </div>
      </div>

      <AnimatedProgressBar value={displayedPercentage} />
    </button>
  )
}

function getStatusBadgeClassName(status: DerivedStatus) {
  switch (status) {
    case DERIVED_STATUSES.active:
      return "border-success-border bg-success-surface text-success"
    case DERIVED_STATUSES.finished:
      return "border-status-neutral-border bg-status-neutral-surface text-status-neutral"
  }
}
