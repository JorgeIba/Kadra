import { ArrowLeft } from "lucide-react"
import type {
  EarningsPeriod,
  InvestmentEarningsBreakdown,
  PortfolioEarningsView,
  Investment,
} from "@/domain/investments"
import { getPortfolioEarningsSnapshot } from "@/domain/investments"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatMxn, formatPercentage } from "@/lib/formatters"

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

const CONTRIBUTION_LABELS = {
  daily: "1-day contributors",
  weekly: "7-day contributors",
  monthly: "30-day contributors",
  yearly: "1-year contributors",
} as const satisfies Record<EarningsPeriod, string>

export function EarningsScreen({ investments, onBack }: EarningsScreenProps) {
  const snapshot = getPortfolioEarningsSnapshot(investments, new Date())

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
        {CONTRIBUTION_LABELS[breakdownPeriod]}
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
