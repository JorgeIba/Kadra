import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { DERIVED_STATUS_LABELS, type Investment } from "@/domain/investments"
import {
  EARNED_MONEY_SORT_OPTIONS,
  getEarnedMoneySortLabel,
  getPortfolioEarnedMoneySnapshot,
  type EarnedMoneySortOption,
  type InvestmentEarnedMoneyBreakdown,
} from "@/app/screens/earnings/earnings-view-model"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatMxn, formatPercentage } from "@/lib/formatters"

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
    <section className="space-y-7">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back
      </Button>

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Earned money
        </p>
        <h1 className="font-ledger text-3xl font-normal tracking-normal text-foreground">
          See how much your portfolio has already produced.
        </h1>
      </div>

      <Card className="rounded-lg bg-secondary/55">
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Total earned so far</p>
            <p className="font-ledger text-4xl leading-none text-foreground tabular-nums">
              {formatMxn(snapshot.totalEarnedAmount)}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
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
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-base font-bold leading-tight text-foreground">
                Breakdown by investment
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Includes active and finished investments using the earnings each
                one has produced so far.
              </p>
            </div>

            <div className="w-full min-w-0 sm:w-52">
              <Select
                value={sortBy}
                onValueChange={(value) => {
                  if (value !== null) {
                    setSortBy(value)
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: EarnedMoneySortOption | null) =>
                      value === null
                        ? "Sort by"
                        : getEarnedMoneySortLabel(value)
                    }
                  </SelectValue>
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
        </CardContent>
      </Card>
    </section>
  )
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background/55 px-3 py-3">
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
      <p className="text-sm leading-6 text-muted-foreground">
        Add investments to start tracking earned money.
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
                <span className="rounded-full bg-secondary px-2 py-1 text-[0.68rem] font-medium text-primary">
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

          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary/70"
              style={{ width: `${investment.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
