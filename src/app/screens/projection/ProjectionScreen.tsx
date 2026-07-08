import { useState } from "react"
import { ArrowLeft, Building2, CalendarDays } from "lucide-react"
import { AnimatedProgressBar } from "@/app/components/AnimatedProgressBar"
import { AnimatedListSurface } from "@/app/components/AnimatedListSurface"
import { GroupedMetricList } from "@/app/components/GroupedMetricList"
import { LabeledSelectControl } from "@/app/components/LabeledSelectControl"
import { MoneyAmount } from "@/app/components/MoneyAmount"
import { PortfolioEarningPaceMetrics } from "@/app/components/PortfolioEarningPaceMetrics"
import { PortfolioProjectionLineChart } from "@/app/components/PortfolioProjectionLineChart"
import { TrustNotesPopover } from "@/app/components/TrustNotes"
import {
  compareCalendarDatesAscending,
  isCalendarDateString,
  toDateString,
  type Investment,
} from "@/domain/investments"
import {
  PROJECTION_GROUP_BY_LABELS,
  PROJECTION_GROUP_BY_OPTION_VALUES,
  PROJECTION_GROUP_BY_OPTIONS,
  type ProjectionGroupByOption,
} from "@/app/screens/projection/projection-grouping"
import {
  getDefaultProjectionTargetDate,
  getPortfolioProjectionSnapshot,
  type InvestmentProjectionBreakdownItem,
} from "@/app/screens/projection/projection-view-model"
import { createGroups, type GroupIdentity } from "@/app/shared/grouping"
import { getInstitutionGroup } from "@/app/shared/institution-grouping"
import { getInvestmentTypeGroup } from "@/app/shared/investment-type-grouping"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatDisplayDate, formatPercentage } from "@/lib/formatters"

interface ProjectionScreenProps {
  investments: Investment[]
  onBack: () => void
  onInvestmentSelect: (investmentId: string) => void
}

const PROJECTION_TRUST_NOTES = [
  "Uses the investments, contributions, and rates saved on this device.",
  "Assumes no future contributions, renewals, or transfers.",
  "Finished fixed-term investments leave active value at maturity.",
]

export function ProjectionScreen({
  investments,
  onBack,
  onInvestmentSelect,
}: ProjectionScreenProps) {
  const asOfDate = new Date()
  const today = toDateString(asOfDate)
  const [targetDate, setTargetDate] = useState(() => {
    return getDefaultProjectionTargetDate(asOfDate)
  })
  const [groupByOption, setGroupByOption] = useState<ProjectionGroupByOption>(
    PROJECTION_GROUP_BY_OPTIONS.none,
  )
  const isTargetDateValid =
    isCalendarDateString(targetDate) &&
    compareCalendarDatesAscending(targetDate, today) >= 0
  const snapshot = getPortfolioProjectionSnapshot(
    investments,
    asOfDate,
    isTargetDateValid ? targetDate : today,
  )

  const targetPoint = snapshot.points.at(-1)
  const breakdownTransitionKey = [
    targetDate,
    groupByOption,
    snapshot.breakdown.length,
  ].join(":")

  return (
    <section className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
        <ArrowLeft className="size-4" aria-hidden="true" />
        Dashboard
      </Button>

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Dashboard report
        </p>
        <h1 className="text-balance font-ledger text-3xl font-normal tracking-normal text-foreground">
          Projected active portfolio value.
        </h1>
      </div>

      <div className="space-y-6">
        <section className="overflow-hidden border-y border-border/70">
          <div className="py-5">
            <div className="space-y-2">
              <p className="text-pretty text-sm leading-6 text-muted-foreground">
                By {formatDisplayDate(snapshot.targetDate)}, active investments
                are projected to earn
              </p>
              <p className="font-ledger text-4xl leading-none text-foreground tabular-nums">
                <MoneyAmount value={snapshot.projectedEarnings} />
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm leading-6 text-muted-foreground">
                  {formatInvestmentCount(
                    snapshot.activeInvestmentCount,
                    "active investment",
                    "active investments",
                  )}{" "}
                  · {snapshot.finishedInvestmentCount} finished by target
                </p>
                <TrustNotesPopover
                  label="Projection assumptions"
                  notes={PROJECTION_TRUST_NOTES}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border/70 py-4">
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
                    isTargetDateValid
                      ? undefined
                      : "projection-target-date-error"
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
        </section>

        <section className="space-y-5 border-t border-border/70 pt-5">
          <div className="space-y-2">
            <h2 className="text-balance text-base font-bold leading-tight text-foreground">
              Value path
            </h2>
            <p className="text-pretty text-sm leading-6 text-muted-foreground">
              Active value changes as fixed-term investments reach maturity.
            </p>
          </div>

          <div>
            <PortfolioProjectionLineChart
              className="h-64"
              points={snapshot.points}
            />
            {targetPoint === undefined ? null : (
              <div className="mt-3 flex items-center justify-between gap-4 text-xs text-muted-foreground">
                <span>
                  Today <MoneyAmount value={snapshot.currentValue} />
                </span>
                <span className="text-right">
                  Target <MoneyAmount value={targetPoint.estimatedValue} />
                </span>
              </div>
            )}
          </div>

          <PortfolioEarningPaceMetrics
            title="Pace on target date"
            description="Based on investments still active on the target date."
            pace={snapshot.earningPace}
          />
        </section>

        <section className="space-y-5 border-t border-border/70 pt-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-balance text-base font-bold leading-tight text-foreground">
                Projected earnings by investment
              </h2>
            </div>

            <div className="w-full min-w-0 rounded-lg border border-border/70 bg-card/45 p-2.5">
              <LabeledSelectControl
                ariaLabel="Group investments"
                fallbackLabel="Select grouping"
                icon={<Building2 className="size-3.5" aria-hidden="true" />}
                label="Group by"
                options={PROJECTION_GROUP_BY_OPTION_VALUES}
                value={groupByOption}
                getOptionLabel={(option) => PROJECTION_GROUP_BY_LABELS[option]}
                onValueChange={setGroupByOption}
              />
            </div>
          </div>

          <AnimatedListSurface transitionKey={breakdownTransitionKey}>
            <ProjectionBreakdown
              breakdown={snapshot.breakdown}
              groupByOption={groupByOption}
              onInvestmentSelect={onInvestmentSelect}
              projectedEarnings={snapshot.projectedEarnings}
            />
          </AnimatedListSurface>
        </section>
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
  groupByOption,
  onInvestmentSelect,
  projectedEarnings,
}: {
  breakdown: InvestmentProjectionBreakdownItem[]
  groupByOption: ProjectionGroupByOption
  onInvestmentSelect: (investmentId: string) => void
  projectedEarnings: number
}) {
  if (breakdown.length === 0) {
    return (
      <p className="text-pretty text-sm leading-6 text-muted-foreground">
        Add investments to start projecting future earnings.
      </p>
    )
  }

  if (groupByOption === PROJECTION_GROUP_BY_OPTIONS.institution) {
    return (
      <ProjectionBreakdownGroups
        breakdown={breakdown}
        getGroup={(investment) =>
          getInstitutionGroup(investment.institutionName)
        }
        onInvestmentSelect={onInvestmentSelect}
        projectedEarnings={projectedEarnings}
      />
    )
  }

  if (groupByOption === PROJECTION_GROUP_BY_OPTIONS.type) {
    return (
      <ProjectionBreakdownGroups
        breakdown={breakdown}
        getGroup={(investment) => getInvestmentTypeGroup(investment.type)}
        onInvestmentSelect={onInvestmentSelect}
        projectedEarnings={projectedEarnings}
      />
    )
  }

  return (
    <div className="space-y-5">
      {breakdown.map((investment) => (
        <ProjectionBreakdownRow
          key={investment.investmentId}
          investment={investment}
          onSelect={onInvestmentSelect}
        />
      ))}
    </div>
  )
}

function ProjectionBreakdownGroups({
  breakdown,
  getGroup,
  onInvestmentSelect,
  projectedEarnings,
}: {
  breakdown: InvestmentProjectionBreakdownItem[]
  getGroup: (investment: InvestmentProjectionBreakdownItem) => GroupIdentity
  onInvestmentSelect: (investmentId: string) => void
  projectedEarnings: number
}) {
  const groups = createGroups(breakdown, {
    getGroup,
    metric: {
      key: "projected",
      label: "Projected",
      getValue: (investment) => investment.projectedEarnings,
      totalValue: projectedEarnings,
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
        <ProjectionBreakdownRow
          key={item.source.investmentId}
          investment={item.source}
          percentage={item.contributionMetric.shareOfGroup}
          onSelect={onInvestmentSelect}
        />
      )}
    />
  )
}

function ProjectionBreakdownRow({
  investment,
  onSelect,
  percentage,
}: {
  investment: InvestmentProjectionBreakdownItem
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
          <p className="truncate font-ledger text-base text-foreground">
            {investment.name}
          </p>
          <p className="mt-2 truncate text-xs text-muted-foreground">
            {investment.institutionName}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-ledger text-sm font-bold text-foreground tabular-nums">
            <MoneyAmount value={investment.projectedEarnings} />
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
