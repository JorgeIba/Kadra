import { useState } from "react"
import { ArrowLeft, CalendarDays } from "lucide-react"
import { AnimatedProgressBar } from "@/app/components/AnimatedProgressBar"
import { PortfolioEarningPaceMetrics } from "@/app/components/PortfolioEarningPaceMetrics"
import { PortfolioProjectionLineChart } from "@/app/components/PortfolioProjectionLineChart"
import {
  compareCalendarDatesAscending,
  isCalendarDateString,
  toDateString,
  type Investment,
} from "@/domain/investments"
import {
  getDefaultProjectionTargetDate,
  getPortfolioProjectionSnapshot,
  type InvestmentProjectionBreakdownItem,
} from "@/app/screens/projection/projection-view-model"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  formatDisplayDate,
  formatMxn,
  formatPercentage,
} from "@/lib/formatters"

interface ProjectionScreenProps {
  investments: Investment[]
  onBack: () => void
}

export function ProjectionScreen({
  investments,
  onBack,
}: ProjectionScreenProps) {
  const asOfDate = new Date()
  const today = toDateString(asOfDate)
  const [targetDate, setTargetDate] = useState(() => {
    return getDefaultProjectionTargetDate(asOfDate)
  })
  const isTargetDateValid =
    isCalendarDateString(targetDate) &&
    compareCalendarDatesAscending(targetDate, today) >= 0
  const snapshot = getPortfolioProjectionSnapshot(
    investments,
    asOfDate,
    isTargetDateValid ? targetDate : today,
  )

  const targetPoint = snapshot.points.at(-1)

  return (
    <section className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back
      </Button>

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Projection</p>
        <h1 className="text-balance font-ledger text-3xl font-normal tracking-normal text-foreground">
          Projected active portfolio value.
        </h1>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground">
        <div className="space-y-4 px-4 py-5">
          <div className="space-y-2">
            <p className="text-pretty text-sm leading-6 text-muted-foreground">
              By {formatDisplayDate(snapshot.targetDate)}, active investments
              are projected to earn
            </p>
            <p className="font-ledger text-4xl leading-none text-foreground tabular-nums">
              {formatMxn(snapshot.projectedEarnings)}
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              {formatInvestmentCount(
                snapshot.activeInvestmentCount,
                "active investment",
                "active investments",
              )}{" "}
              · {snapshot.finishedInvestmentCount} finished by target
            </p>
          </div>
        </div>

        <div className="border-t border-border/70 px-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="projection-target-date">Target date</Label>
            <div className="flex items-center gap-2">
              <Input
                id="projection-target-date"
                type="date"
                min={today}
                value={targetDate}
                aria-invalid={!isTargetDateValid}
                aria-describedby={
                  isTargetDateValid ? undefined : "projection-target-date-error"
                }
                onChange={(event) => setTargetDate(event.target.value)}
              />
              <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-background/60 text-primary">
                <CalendarDays className="size-4" aria-hidden="true" />
              </div>
            </div>
            {isTargetDateValid ? null : (
              <p
                id="projection-target-date-error"
                className="text-xs leading-5 text-destructive"
              >
                Choose today or a future date.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-5 border-t border-border/70 px-4 py-5">
          <div className="space-y-2">
            <h2 className="text-balance text-base font-bold leading-tight text-foreground">
              Value path
            </h2>
            <p className="text-pretty text-sm leading-6 text-muted-foreground">
              Assumes no future contributions or renewals. Fixed-term
              investments stop earning and leave the active total at maturity.
            </p>
          </div>

          <div>
            <PortfolioProjectionLineChart
              className="h-64"
              points={snapshot.points}
            />
            {targetPoint === undefined ? null : (
              <div className="mt-3 flex items-center justify-between gap-4 text-xs text-muted-foreground">
                <span>Today {formatMxn(snapshot.currentValue)}</span>
                <span className="text-right">
                  Target {formatMxn(targetPoint.estimatedValue)}
                </span>
              </div>
            )}
          </div>

          <PortfolioEarningPaceMetrics
            title="Pace on target date"
            description="Based on investments still active on the target date."
            pace={snapshot.earningPace}
          />
        </div>

        <div className="space-y-5 border-t border-border/70 px-4 py-5">
          <div className="space-y-2">
            <h2 className="text-balance text-base font-bold leading-tight text-foreground">
              Projected earnings by investment
            </h2>
            <p className="text-pretty text-sm leading-6 text-muted-foreground">
              Ranked by expected earnings between today and the target date.
            </p>
          </div>

          <ProjectionBreakdown breakdown={snapshot.breakdown} />
        </div>
      </div>
    </section>
  )
}

function formatInvestmentCount(
  count: number,
  singularLabel: string,
  pluralLabel: string,
) {
  return `${count} ${count === 1 ? singularLabel : pluralLabel}`
}

function ProjectionBreakdown({
  breakdown,
}: {
  breakdown: InvestmentProjectionBreakdownItem[]
}) {
  if (breakdown.length === 0) {
    return (
      <p className="text-pretty text-sm leading-6 text-muted-foreground">
        Add investments to start projecting future earnings.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      {breakdown.map((investment) => (
        <div key={investment.investmentId} className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate font-ledger text-base text-foreground">
                {investment.name}
              </p>
              <p className="mt-2 truncate text-xs text-muted-foreground">
                {investment.institutionName}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="font-ledger text-sm font-bold text-foreground tabular-nums">
                {formatMxn(investment.projectedEarnings)}
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
