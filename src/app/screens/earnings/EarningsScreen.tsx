import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import type {
  EarningsPeriod,
  InvestmentEarningsBreakdown,
  PortfolioEarningsView,
  Investment,
} from "@/domain/investments"
import {
  EARNINGS_PERIODS,
  getPortfolioEarningsSnapshot,
} from "@/domain/investments"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatMxn, formatPercentage } from "@/lib/formatters"
import { cn } from "@/lib/utils"

interface EarningsScreenProps {
  investments: Investment[]
  onBack: () => void
}

const EARNINGS_METRICS = [
  { key: "daily", label: "1 day" },
  { key: "weekly", label: "7 days" },
  { key: "monthly", label: "30 days" },
  { key: "yearly", label: "1 year" },
] as const

const BREAKDOWN_PERIOD_OPTIONS = [
  {
    value: EARNINGS_PERIODS.daily,
    shortLabel: "1D",
    label: "1 day",
  },
  {
    value: EARNINGS_PERIODS.weekly,
    shortLabel: "7D",
    label: "7 days",
  },
  {
    value: EARNINGS_PERIODS.monthly,
    shortLabel: "30D",
    label: "30 days",
  },
  {
    value: EARNINGS_PERIODS.yearly,
    shortLabel: "1Y",
    label: "1 year",
  },
] as const

const BREAKDOWN_LABELS = {
  daily: "1-day earnings breakdown",
  weekly: "7-day earnings breakdown",
  monthly: "30-day earnings breakdown",
  yearly: "1-year earnings breakdown",
} as const satisfies Record<EarningsPeriod, string>

export function EarningsScreen({ investments, onBack }: EarningsScreenProps) {
  const [breakdownPeriod, setBreakdownPeriod] = useState<EarningsPeriod>(
    EARNINGS_PERIODS.monthly,
  )
  const snapshot = getPortfolioEarningsSnapshot(
    investments,
    new Date(),
    breakdownPeriod,
  )

  return (
    <section className="space-y-7">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back
      </Button>

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Earnings exploration
        </p>
        <h1 className="font-ledger text-3xl font-normal tracking-normal text-foreground">
          Compare what is coming next with what a full period can produce.
        </h1>
      </div>

      <BreakdownPeriodPicker
        selectedPeriod={breakdownPeriod}
        onSelectPeriod={setBreakdownPeriod}
      />

      <EarningsViewCard
        title="Upcoming earnings"
        description="Uses the real portfolio state today, including each investment's remaining time to maturity."
        view={snapshot.upcoming}
      />

      <EarningsViewCard
        title="Period earnings"
        description="Measures what each investment can produce over a fresh period while still respecting its term length."
        view={snapshot.period}
      />
    </section>
  )
}

function BreakdownPeriodPicker({
  selectedPeriod,
  onSelectPeriod,
}: {
  selectedPeriod: EarningsPeriod
  onSelectPeriod: (period: EarningsPeriod) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 bg-card/55 px-3 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">Breakdown window</p>
        <p className="text-xs leading-5 text-muted-foreground">
          Change the time horizon for both earnings views.
        </p>
      </div>

      <div
        className="inline-flex min-h-11 flex-wrap items-center gap-1 rounded-lg bg-background/70 p-1"
        role="tablist"
        aria-label="Breakdown window"
      >
        {BREAKDOWN_PERIOD_OPTIONS.map((option) => {
          const isSelected = option.value === selectedPeriod

          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-label={option.label}
              title={option.label}
              className={cn(
                "min-h-9 rounded-md px-3 text-sm font-medium transition-[transform,background-color,color,box-shadow] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] active:translate-y-px active:scale-[0.99] motion-reduce:transform-none motion-reduce:transition-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground active:bg-secondary/90 active:text-foreground",
              )}
              onClick={() => onSelectPeriod(option.value)}
            >
              {option.shortLabel}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function EarningsViewCard({
  description,
  title,
  view,
}: {
  description: string
  title: string
  view: PortfolioEarningsView
}) {
  return (
    <Card className="rounded-lg">
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-base font-bold leading-tight text-foreground">
            {title}
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-6">
          {EARNINGS_METRICS.map((metric) => (
            <div key={metric.key} className="space-y-2">
              <p className="text-xs leading-none text-muted-foreground">
                {metric.label}
              </p>
              <p className="font-ledger text-xl leading-none text-foreground tabular-nums">
                {formatMxn(view.totals[metric.key])}
              </p>
            </div>
          ))}
        </div>

        <ContributionSection
          breakdownPeriod={view.breakdownPeriod}
          breakdown={view.breakdown}
        />
      </CardContent>
    </Card>
  )
}

function ContributionSection({
  breakdownPeriod,
  breakdown,
}: {
  breakdownPeriod: EarningsPeriod
  breakdown: InvestmentEarningsBreakdown
}) {
  return (
    <div className="space-y-3">
      <h3 className="border-b border-border/70 pb-3 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {BREAKDOWN_LABELS[breakdownPeriod]}
      </h3>
      <div className="space-y-5">
        {breakdown.map((contribution) => (
          <div key={contribution.investmentId} className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate font-ledger text-base text-foreground">
                  {contribution.name}
                </p>
                <p className="mt-2 truncate text-xs text-muted-foreground">
                  {contribution.institutionName}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-ledger text-sm font-bold text-foreground tabular-nums">
                  {formatMxn(contribution.estimatedEarnings)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage(contribution.percentage)}
                </p>
              </div>
            </div>

            <div className="h-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/70"
                style={{ width: `${contribution.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
