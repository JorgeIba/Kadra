import { useState } from "react"
import { useId, useRef } from "react"
import {
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  MinusCircle,
  RefreshCw,
  Wallet,
  type LucideIcon,
} from "lucide-react"
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
  REINVESTMENT_STRATEGIES,
  type Investment,
  type ReinvestmentStrategy,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatDisplayDate, formatPercentage } from "@/lib/formatters"
import { cn } from "@/lib/utils"

interface ProjectionScreenProps {
  investments: Investment[]
  onInvestmentSelect: (investmentId: string) => void
}

const PROJECTION_TRUST_NOTES = [
  "Uses the investments, contributions, and rates saved on this device.",
  "Does not model new deposits, rate changes, or transfers.",
  "Applies the selected strategy when fixed-term investments mature.",
]

const PROJECTION_STRATEGY_OPTIONS: ReadonlyArray<{
  label: string
  outcome: string
  screenReaderDescription: string
  summary: string
  icon: LucideIcon
  value: ReinvestmentStrategy
}> = [
  {
    value: REINVESTMENT_STRATEGIES.keepAsCash,
    label: "Cash",
    summary: "Hold as cash",
    outcome: "Stops earning",
    screenReaderDescription:
      "Keep the matured balance in your total, but stop earning.",
    icon: Wallet,
  },
  {
    value: REINVESTMENT_STRATEGIES.reinvest,
    label: "Reinvest",
    summary: "Reinvest at current rate",
    outcome: "Keeps earning",
    screenReaderDescription:
      "Illustrative scenario. Let the matured balance keep earning at its current rate.",
    icon: RefreshCw,
  },
  {
    value: REINVESTMENT_STRATEGIES.strict,
    label: "Exclude",
    summary: "Exclude at maturity",
    outcome: "Not included",
    screenReaderDescription:
      "Conservative scenario. Leave matured fixed-term value out of the projected total.",
    icon: MinusCircle,
  },
]

export function ProjectionScreen({
  investments,
  onInvestmentSelect,
}: ProjectionScreenProps) {
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

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Dashboard report
        </p>
        <h1 className="text-balance font-ledger text-3xl font-normal tracking-normal text-foreground">
          Projected portfolio value.
        </h1>
      </div>

      <div className="space-y-6">
        <section className="overflow-hidden border-y border-border/70">
          <div className="py-5">
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Projected value on {formatDisplayDate(snapshot.targetDate)}
              </p>
              <p className="font-ledger text-[2.7rem] leading-none text-foreground tabular-nums">
                <MoneyAmount value={snapshot.projectedValue} />
              </p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-6 text-muted-foreground">
                <span>
                  <MoneyAmount value={snapshot.projectedEarnings} /> earned by
                  target
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {formatInvestmentCount(
                    snapshot.activeInvestmentCount,
                    "investment earning",
                    "investments earning",
                  )}
                </span>
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

          {snapshot.hasMaturityScenario ? (
            <div className="border-t border-border/70 py-4">
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-foreground">
                  Maturity scenario
                </h2>
                <ProjectionStrategyPicker
                  value={strategy}
                  onValueChange={setStrategy}
                />
                <ProjectionStrategyOutcome
                  excludedValue={snapshot.excludedValue}
                  maturedCash={snapshot.maturedCash}
                  strategy={strategy}
                />
              </div>
            </div>
          ) : null}
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
              <LabeledSelectControl<ProjectionGroupByOption>
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

interface ProjectionStrategyPickerProps {
  onValueChange: (value: ReinvestmentStrategy) => void
  value: ReinvestmentStrategy
}

function ProjectionStrategyPicker({
  onValueChange,
  value,
}: ProjectionStrategyPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionsId = useId()
  const selectedOption = PROJECTION_STRATEGY_OPTIONS.find((option) => {
    return option.value === value
  })

  return (
    <div className="space-y-3">
      <button
        ref={triggerRef}
        type="button"
        aria-controls={optionsId}
        aria-expanded={isOpen}
        aria-label={`Maturity scenario: ${selectedOption?.summary ?? "Select a scenario"}`}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-4 rounded-lg border px-3 text-left outline-none transition-[transform,background-color,border-color,box-shadow] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-primary/25 hover:bg-muted/35 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px active:scale-[0.995] motion-reduce:transform-none motion-reduce:transition-none",
          isOpen
            ? "border-primary/45 bg-accent/35"
            : "border-border/75 bg-background/25",
        )}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        <span className="min-w-0 truncate text-sm font-medium text-foreground">
          {selectedOption?.summary}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            isOpen && "rotate-180 text-primary",
          )}
          aria-hidden="true"
        />
      </button>

      <div
        id={optionsId}
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={cn(
          "grid transition-[grid-template-rows] duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <ProjectionStrategyOptionsRow
          isOpen={isOpen}
          value={value}
          onValueChange={(nextStrategy) => {
            onValueChange(nextStrategy)
            setIsOpen(false)
            requestAnimationFrame(() => triggerRef.current?.focus())
          }}
        />
      </div>

      <p className="sr-only" role="status" aria-atomic="true">
        Projection updated: {selectedOption?.summary}.
      </p>
    </div>
  )
}

interface ProjectionStrategyOptionsRowProps {
  isOpen: boolean
  onValueChange: (value: ReinvestmentStrategy) => void
  value: ReinvestmentStrategy
}

function ProjectionStrategyOptionsRow({
  isOpen,
  onValueChange,
  value,
}: ProjectionStrategyOptionsRowProps) {
  return (
    <fieldset className="min-h-0 overflow-hidden">
      <legend className="sr-only">Choose a maturity scenario</legend>
      <div className="grid grid-cols-3 gap-2 pt-3">
        {PROJECTION_STRATEGY_OPTIONS.map((option, index) => {
          const Icon = option.icon
          const isSelected = option.value === value

          return (
            <label
              key={option.value}
              className={cn(
                "flex min-h-26 cursor-pointer flex-col justify-between rounded-lg border p-3 transition-[transform,opacity,background-color,border-color,box-shadow] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none",
                isOpen
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-1 opacity-0",
                isSelected
                  ? "border-primary/60 bg-accent/50 text-foreground"
                  : "border-border/75 bg-background/35 text-muted-foreground hover:border-primary/30 hover:bg-muted/40",
              )}
              style={{
                transitionDelay: isOpen ? `${index * 28}ms` : "0ms",
              }}
            >
              <input
                checked={isSelected}
                className="sr-only"
                name="projection-maturity-scenario"
                tabIndex={isOpen ? 0 : -1}
                type="radio"
                value={option.value}
                aria-label={`${option.label}: ${option.screenReaderDescription}`}
                onChange={() => onValueChange(option.value)}
              />
              <span className="flex items-center justify-between gap-2">
                <Icon
                  className={cn(
                    "size-4",
                    isSelected ? "text-primary" : "text-muted-foreground",
                  )}
                  aria-hidden="true"
                />
                <Check
                  className={cn(
                    "size-4 transition-opacity duration-180 motion-reduce:transition-none",
                    isSelected ? "opacity-100 text-primary" : "opacity-0",
                  )}
                  aria-hidden="true"
                />
              </span>
              <span className="space-y-1">
                <span className="block text-sm font-medium text-foreground">
                  {option.label}
                </span>
                <span className="block text-sm leading-5 text-muted-foreground">
                  {option.outcome}
                </span>
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

function ProjectionStrategyOutcome({
  excludedValue,
  maturedCash,
  strategy,
}: {
  excludedValue: number
  maturedCash: number
  strategy: ReinvestmentStrategy
}) {
  const isCashOutcome =
    strategy === REINVESTMENT_STRATEGIES.keepAsCash && maturedCash > 0
  const isStrictOutcome =
    strategy === REINVESTMENT_STRATEGIES.strict && excludedValue > 0
  const shouldShowOutcome = isCashOutcome || isStrictOutcome

  const value = isCashOutcome ? maturedCash : excludedValue
  const label = isCashOutcome
    ? "Held as cash at target"
    : "Excluded at maturity"
  const description = isCashOutcome
    ? "Included in the projected value, but no longer earning."
    : "Not included in the projected value."

  return (
    <div
      aria-hidden={!shouldShowOutcome}
      aria-live={shouldShowOutcome ? "polite" : undefined}
      className={`grid transition-[grid-template-rows] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        shouldShowOutcome ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={`flex items-start justify-between gap-4 border-t border-warning-border/65 pt-4 transition-[opacity,transform] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            shouldShowOutcome
              ? "translate-y-0 opacity-100"
              : "-translate-y-1 opacity-0"
          }`}
        >
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-sm leading-5 text-muted-foreground">
              {description}
            </p>
          </div>
          <p className="shrink-0 font-ledger text-xl leading-none text-warning tabular-nums">
            <MoneyAmount value={value} />
          </p>
        </div>
      </div>
    </div>
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
