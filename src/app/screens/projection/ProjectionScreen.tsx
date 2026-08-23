import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Building2, CalendarDays } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { AnimatedProgressBar } from "@/app/components/AnimatedProgressBar"
import { AnimatedListSurface } from "@/app/components/AnimatedListSurface"
import { GroupedMetricList } from "@/app/components/GroupedMetricList"
import { LabeledSelectControl } from "@/app/components/LabeledSelectControl"
import { MoneyAmount } from "@/app/components/MoneyAmount"
import { PortfolioEarningPaceMetrics } from "@/app/components/PortfolioEarningPaceMetrics"
import { PortfolioProjectionLineChart } from "@/app/components/PortfolioProjectionLineChart"
import { TrustNotesPopover } from "@/app/components/TrustNotes"
import { useLocale } from "@/app/i18n"
import {
  compareCalendarDatesAscending,
  isCalendarDateString,
  toDateString,
  REINVESTMENT_STRATEGIES,
  type Investment,
  type InvestmentType,
  type ReinvestmentStrategy,
} from "@/domain/investments"
import { getInvestmentTypeLabels } from "@/app/i18n/labels"
import {
  PROJECTION_GROUP_BY_OPTION_VALUES,
  PROJECTION_GROUP_BY_OPTIONS,
  getProjectionGroupByOptionLabels,
  type ProjectionGroupByOption,
} from "@/app/screens/projection/projection-grouping"
import {
  getDefaultProjectionTargetDate,
  getPortfolioProjectionSnapshot,
  type InvestmentProjectionBreakdownItem,
} from "@/app/screens/projection/projection-view-model"
import { MaturityScenarioControl } from "@/app/screens/projection/MaturityScenarioControl"
import { createGroups, type GroupIdentity } from "@/app/shared/grouping"
import { getInstitutionGroup } from "@/app/shared/institution-grouping"
import { getInvestmentTypeGroup } from "@/app/shared/investment-type-grouping"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatDisplayDate, formatPercentage } from "@/lib/formatters"

interface ProjectionScreenProps {
  investments: Investment[]
  onInvestmentSelect: (investmentId: string) => void
}

const PROJECTION_SECTION_REPOSITION_TRANSITION = {
  bounce: 0.04,
  duration: 0.35,
  type: "spring",
} as const

export function ProjectionScreen({
  investments,
  onInvestmentSelect,
}: ProjectionScreenProps) {
  const { t } = useTranslation()
  const { activeLocale } = useLocale()
  const prefersReducedMotion = useReducedMotion() ?? false
  const projectionSectionRepositionTransition = prefersReducedMotion
    ? { duration: 0 }
    : PROJECTION_SECTION_REPOSITION_TRANSITION
  const asOfDate = new Date()
  const today = toDateString(asOfDate)
  const [targetDate, setTargetDate] = useState(() => {
    return getDefaultProjectionTargetDate(asOfDate)
  })
  const [strategy, setStrategy] = useState<ReinvestmentStrategy>(
    REINVESTMENT_STRATEGIES.reinvest,
  )
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
    strategy,
  )

  const targetPoint = snapshot.points.at(-1)
  const breakdownTransitionKey = [
    targetDate,
    groupByOption,
    snapshot.breakdown.length,
  ].join(":")
  const groupLabels = getProjectionGroupByOptionLabels(t)
  const investmentTypeLabels = getInvestmentTypeLabels(t)
  const trustNotes = [
    t("projection.trustNotes.contributions"),
    t("projection.trustNotes.rates"),
    t("projection.trustNotes.maturity"),
  ]

  return (
    // Let Motion, rather than browser scroll anchoring, own vertical repositioning.
    <section className="space-y-6 [overflow-anchor:none]">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          {t("projection.reportEyebrow")}
        </p>
        <h1 className="text-balance font-ledger text-3xl font-normal tracking-normal text-foreground">
          {t("projection.title")}
        </h1>
      </div>

      <div className="space-y-6">
        <section className="overflow-hidden border-y border-border/70">
          <div className="py-5">
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                {t("projection.summary.projectedValueOn", {
                  date: formatDisplayDate(snapshot.targetDate, activeLocale),
                })}
              </p>
              <p className="font-ledger text-[2.7rem] leading-none text-foreground tabular-nums">
                <MoneyAmount value={snapshot.projectedValue} />
              </p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-6 text-muted-foreground">
                <span>
                  <MoneyAmount value={snapshot.projectedEarnings} />{" "}
                  {t("projection.summary.earnedByTarget")}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {t("projection.summary.investmentEarning", {
                    count: snapshot.activeInvestmentCount,
                  })}
                </span>
                <TrustNotesPopover
                  label={t("projection.assumptionsLabel")}
                  notes={trustNotes}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border/70 py-4">
            <div className="space-y-2">
              <Label htmlFor="projection-target-date">
                {t("projection.date.label")}
              </Label>
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
                  {t("projection.date.chooseFuture")}
                </p>
              )}
            </div>
          </div>

          {snapshot.hasMaturityScenario ? (
            <MaturityScenarioControl
              comparison={snapshot.comparison}
              onStrategyCommit={setStrategy}
              strategy={strategy}
            />
          ) : null}
        </section>

        <motion.section
          layout="position"
          className="space-y-5 border-t border-border/70 pt-5"
          transition={{ layout: projectionSectionRepositionTransition }}
        >
          <div className="space-y-2">
            <h2 className="text-balance text-base font-bold leading-tight text-foreground">
              {t("projection.valuePath.title")}
            </h2>
            <p className="text-pretty text-sm leading-6 text-muted-foreground">
              {t("projection.valuePath.description")}
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
                  {t("projection.summary.today")}{" "}
                  <MoneyAmount value={snapshot.currentValue} />
                </span>
                <span className="text-right">
                  {t("projection.summary.target")}{" "}
                  <MoneyAmount value={targetPoint.estimatedValue} />
                </span>
              </div>
            )}
          </div>

          <PortfolioEarningPaceMetrics
            title={t("projection.earningPace.title")}
            description={t("projection.earningPace.description")}
            pace={snapshot.earningPace}
          />
        </motion.section>

        <motion.section
          layout="position"
          className="space-y-5 border-t border-border/70 pt-5"
          transition={{ layout: projectionSectionRepositionTransition }}
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-balance text-base font-bold leading-tight text-foreground">
                {t("projection.breakdown.heading")}
              </h2>
            </div>

            <div className="w-full min-w-0 rounded-lg border border-border/70 bg-card/45 p-2.5">
              <LabeledSelectControl<ProjectionGroupByOption>
                ariaLabel={t("projection.controls.groupAriaLabel")}
                fallbackLabel={t("projection.controls.groupFallback")}
                icon={<Building2 className="size-3.5" aria-hidden="true" />}
                label={t("projection.controls.groupLabel")}
                options={PROJECTION_GROUP_BY_OPTION_VALUES}
                value={groupByOption}
                getOptionLabel={(option) => groupLabels[option]}
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
              investmentTypeLabels={investmentTypeLabels}
              emptyMessage={t("projection.breakdown.addInvestments")}
              itemCountLabel={(count) =>
                t("common.counts.investment", { count })
              }
              projectedLabel={t("projection.breakdown.projected")}
            />
          </AnimatedListSurface>
        </motion.section>
      </div>
    </section>
  )
}

function ProjectionBreakdown({
  breakdown,
  emptyMessage,
  groupByOption,
  investmentTypeLabels,
  itemCountLabel,
  onInvestmentSelect,
  projectedEarnings,
  projectedLabel,
}: {
  breakdown: InvestmentProjectionBreakdownItem[]
  emptyMessage: string
  groupByOption: ProjectionGroupByOption
  investmentTypeLabels: Readonly<Record<InvestmentType, string>>
  itemCountLabel: (count: number) => string
  onInvestmentSelect: (investmentId: string) => void
  projectedEarnings: number
  projectedLabel: string
}) {
  const { t } = useTranslation()

  if (breakdown.length === 0) {
    return (
      <p className="text-pretty text-sm leading-6 text-muted-foreground">
        {emptyMessage}
      </p>
    )
  }

  if (groupByOption === PROJECTION_GROUP_BY_OPTIONS.institution) {
    return (
      <ProjectionBreakdownGroups
        breakdown={breakdown}
        getGroup={(investment) =>
          getInstitutionGroup(
            investment.institutionName,
            t("common.grouping.unknownInstitution"),
          )
        }
        onInvestmentSelect={onInvestmentSelect}
        projectedEarnings={projectedEarnings}
        itemCountLabel={itemCountLabel}
        projectedLabel={projectedLabel}
      />
    )
  }

  if (groupByOption === PROJECTION_GROUP_BY_OPTIONS.type) {
    return (
      <ProjectionBreakdownGroups
        breakdown={breakdown}
        getGroup={(investment) =>
          getInvestmentTypeGroup(investment.type, investmentTypeLabels)
        }
        onInvestmentSelect={onInvestmentSelect}
        projectedEarnings={projectedEarnings}
        itemCountLabel={itemCountLabel}
        projectedLabel={projectedLabel}
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
  itemCountLabel,
  onInvestmentSelect,
  projectedEarnings,
  projectedLabel,
}: {
  breakdown: InvestmentProjectionBreakdownItem[]
  getGroup: (investment: InvestmentProjectionBreakdownItem) => GroupIdentity
  itemCountLabel: (count: number) => string
  onInvestmentSelect: (investmentId: string) => void
  projectedEarnings: number
  projectedLabel: string
}) {
  const groups = createGroups(breakdown, {
    getGroup,
    metric: {
      key: "projected",
      label: projectedLabel,
      getValue: (investment) => investment.projectedEarnings,
      totalValue: projectedEarnings,
    },
  })

  return (
    <GroupedMetricList
      groups={groups}
      itemListClassName="divide-y divide-border/60 p-0"
      itemCountLabel={itemCountLabel}
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
  const { activeLocale } = useLocale()
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
            {formatPercentage(displayedPercentage, activeLocale)}
          </p>
        </div>
      </div>

      <AnimatedProgressBar value={displayedPercentage} />
    </button>
  )
}
