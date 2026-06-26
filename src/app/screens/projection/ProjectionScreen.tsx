import { useState } from "react"
import { ArrowLeft, CalendarDays } from "lucide-react"
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
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatMxn, formatPercentage } from "@/lib/formatters"

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

  return (
    <section className="space-y-7">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back
      </Button>

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Projection</p>
        <h1 className="font-ledger text-3xl font-normal tracking-normal text-foreground">
          Estimate what the current portfolio could make.
        </h1>
      </div>

      <Card className="rounded-lg bg-secondary/55">
        <CardContent className="space-y-5">
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

          <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
            <ProjectionMetric
              label="Projected earnings"
              value={formatMxn(snapshot.projectedEarnings)}
            />
            <ProjectionMetric
              label="Projected value"
              value={formatMxn(snapshot.projectedValue)}
            />
            <ProjectionMetric
              label="Current value"
              value={formatMxn(snapshot.currentValue)}
            />
            <ProjectionMetric
              label="Investments"
              value={String(snapshot.investmentCount)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <h2 className="text-base font-bold leading-tight text-foreground">
              Value path
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Assumes no future contributions or renewals. Fixed-term
              investments stop earning at maturity.
            </p>
          </div>

          <PortfolioProjectionLineChart
            className="h-64"
            points={snapshot.points}
          />

          <PortfolioEarningPaceMetrics
            title="Estimated earning pace"
            description="Based on investments still active on the target date."
            pace={snapshot.earningPace}
          />
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <h2 className="text-base font-bold leading-tight text-foreground">
              Projected earnings by investment
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Ranked by expected earnings between today and the target date.
            </p>
          </div>

          <ProjectionBreakdown breakdown={snapshot.breakdown} />
        </CardContent>
      </Card>
    </section>
  )
}

function ProjectionMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background/55 px-3 py-3">
      <p className="text-xs leading-none text-muted-foreground">{label}</p>
      <p className="mt-2 font-ledger text-lg leading-none text-foreground tabular-nums">
        {value}
      </p>
    </div>
  )
}

function ProjectionBreakdown({
  breakdown,
}: {
  breakdown: InvestmentProjectionBreakdownItem[]
}) {
  if (breakdown.length === 0) {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
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
