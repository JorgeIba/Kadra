import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import {
  DERIVED_STATUSES,
  DERIVED_STATUS_LABELS,
  type DerivedStatus,
  type Investment,
} from "@/domain/investments"
import { AnimatedProgressBar } from "@/app/components/AnimatedProgressBar"
import {
  EARNED_MONEY_SORT_OPTIONS,
  getEarnedMoneySortLabel,
  getPortfolioEarnedMoneySnapshot,
  type EarnedMoneySortOption,
  type InvestmentEarnedMoneyBreakdown,
} from "@/app/screens/earnings/earnings-view-model"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatMxn, formatPercentage } from "@/lib/formatters"
import { cn } from "@/lib/utils"

interface EarningsScreenProps {
  investments: Investment[]
  onBack: () => void
}

const EARNED_MONEY_SORT_CHOICES = [
  EARNED_MONEY_SORT_OPTIONS.highestEarned,
  EARNED_MONEY_SORT_OPTIONS.lowestEarned,
  EARNED_MONEY_SORT_OPTIONS.name,
  EARNED_MONEY_SORT_OPTIONS.status,
] as const satisfies ReadonlyArray<EarnedMoneySortOption>

function isEarnedMoneySortOption(
  value: string | null,
): value is EarnedMoneySortOption {
  return EARNED_MONEY_SORT_CHOICES.some((option) => {
    return option === value
  })
}

export function EarningsScreen({ investments, onBack }: EarningsScreenProps) {
  const [sortBy, setSortBy] = useState<EarnedMoneySortOption>(
    EARNED_MONEY_SORT_OPTIONS.highestEarned,
  )
  const snapshot = getPortfolioEarnedMoneySnapshot(
    investments,
    new Date(),
    sortBy,
  )

  return (
    <section className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back
      </Button>

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Earned return
        </p>
        <h1 className="text-balance font-ledger text-3xl font-normal tracking-normal text-foreground">
          Return earned by the portfolio.
        </h1>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground">
        <div className="space-y-4 px-4 py-5">
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Total earned return</p>
            <p className="font-ledger text-4xl leading-none text-foreground tabular-nums">
              {formatMxn(snapshot.totalEarnedAmount)}
            </p>
            <p className="text-pretty text-sm leading-6 text-muted-foreground">
              Includes estimated return from active and finished investments
              through today.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 border-t border-border/70">
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

        <div className="space-y-6 border-t border-border/70 px-4 py-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-balance text-base font-bold leading-tight text-foreground">
                Breakdown by investment
              </h2>
              <p className="text-pretty text-sm leading-6 text-muted-foreground">
                Ranked by the estimated return each investment has produced.
              </p>
            </div>

            <div className="w-full min-w-0 sm:w-52">
              <Select
                value={sortBy}
                onValueChange={(value) => {
                  if (isEarnedMoneySortOption(value)) {
                    setSortBy(value)
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>{getEarnedMoneySortLabel(sortBy)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {EARNED_MONEY_SORT_CHOICES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {getEarnedMoneySortLabel(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <EarningsBreakdownList breakdown={snapshot.breakdown} />
        </div>
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
}: {
  breakdown: InvestmentEarnedMoneyBreakdown
}) {
  if (breakdown.length === 0) {
    return (
      <p className="text-pretty text-sm leading-6 text-muted-foreground">
        Add investments to start tracking earned return.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      {breakdown.map((investment) => (
        <div key={investment.investmentId} className="space-y-3">
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
                {formatMxn(investment.earnedAmount)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatPercentage(investment.percentage)}
              </p>
            </div>
          </div>

          <AnimatedProgressBar value={investment.percentage} />
        </div>
      ))}
    </div>
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
