import { MinusCircle, RefreshCw, Wallet } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import {
  ExpandingChoicePicker,
  type ExpandingChoicePickerOption,
} from "@/app/components/ExpandingChoicePicker"
import { MoneyAmount } from "@/app/components/MoneyAmount"
import { usePickerWithDependentContent } from "@/app/components/use-picker-with-dependent-content"
import {
  REINVESTMENT_STRATEGIES,
  type ReinvestmentStrategy,
} from "@/domain/investments"
import type { PortfolioProjectionComparison } from "@/app/screens/projection/projection-view-model"

interface MaturityScenarioControlProps {
  comparison: PortfolioProjectionComparison | null
  onStrategyCommit: (strategy: ReinvestmentStrategy) => void
  strategy: ReinvestmentStrategy
}

interface MaturityScenarioOutcome {
  description: string
  key: ReinvestmentStrategy
  label: string
  valueLabel: string
  value: number
}

const OUTCOME_CONTAINER_REFLOW_TRANSITION = {
  bounce: 0.04,
  duration: 0.35,
  type: "spring",
} as const

const OUTCOME_CONTENT_ENTER_EXIT_TRANSITION = {
  bounce: 0.02,
  duration: 0.24,
  type: "spring",
} as const

const MATURITY_SCENARIO_OPTIONS = [
  {
    value: REINVESTMENT_STRATEGIES.reinvest,
    label: "Reinvest",
    summary: "Reinvest at current rate",
    description: "Keeps earning",
    icon: RefreshCw,
  },
  {
    value: REINVESTMENT_STRATEGIES.keepAsCash,
    label: "Cash",
    summary: "Hold as cash",
    description: "Stops earning",
    icon: Wallet,
  },
  {
    value: REINVESTMENT_STRATEGIES.strict,
    label: "Exclude",
    summary: "Exclude at maturity",
    description: "Not included",
    icon: MinusCircle,
  },
] satisfies readonly ExpandingChoicePickerOption<ReinvestmentStrategy>[]

export function MaturityScenarioControl({
  comparison,
  onStrategyCommit,
  strategy,
}: MaturityScenarioControlProps) {
  const outcome = deriveProjectionStrategyOutcome(comparison)
  const pickerInteraction = usePickerWithDependentContent({
    hasVisibleDependentContent: outcome !== null,
  })

  return (
    <div className="border-t border-border/70 py-4">
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-foreground">
          Maturity scenario
        </h2>
        <ExpandingChoicePicker
          ariaLabel="Maturity scenario"
          canStartPendingOpening={
            pickerInteraction.canStartPendingPickerOpening
          }
          legend="Choose a maturity scenario"
          onCloseComplete={pickerInteraction.onPickerCloseComplete}
          onOpenRequest={pickerInteraction.onPickerOpenRequest}
          onValueCommit={onStrategyCommit}
          options={MATURITY_SCENARIO_OPTIONS}
          value={strategy}
        />
        <ProjectionStrategyOutcome
          isVisible={pickerInteraction.shouldRenderDependentContent}
          outcome={outcome}
          onExitComplete={pickerInteraction.onDependentContentExitComplete}
        />
      </div>
    </div>
  )
}

function ProjectionStrategyOutcome({
  isVisible,
  onExitComplete,
  outcome,
}: {
  isVisible: boolean
  onExitComplete: () => void
  outcome: MaturityScenarioOutcome | null
}) {
  const prefersReducedMotion = useReducedMotion() ?? false
  const outcomeContainerReflowTransition = prefersReducedMotion
    ? { duration: 0 }
    : OUTCOME_CONTAINER_REFLOW_TRANSITION
  const outcomeContentEnterExitTransition = prefersReducedMotion
    ? { duration: 0 }
    : OUTCOME_CONTENT_ENTER_EXIT_TRANSITION
  const shouldRenderOutcome = isVisible && outcome !== null

  return (
    <motion.div
      layout
      aria-live={shouldRenderOutcome ? "polite" : undefined}
      transition={{ layout: outcomeContainerReflowTransition }}
    >
      <AnimatePresence initial={false} onExitComplete={onExitComplete}>
        {shouldRenderOutcome ? (
          <motion.div
            key={outcome.key}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={outcomeContentEnterExitTransition}
            className="space-y-1.5 border-t border-warning-border/65 pt-4"
          >
            <p className="text-sm font-medium text-foreground">
              {outcome.label}
            </p>
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="font-ledger text-xl leading-none text-warning tabular-nums">
                <MoneyAmount value={outcome.value} />
              </span>
              <span className="text-xs leading-4 text-muted-foreground">
                {outcome.valueLabel}
              </span>
            </p>
            <p className="text-sm leading-5 text-muted-foreground">
              {outcome.description}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}

function deriveProjectionStrategyOutcome(
  comparison: PortfolioProjectionComparison | null,
): MaturityScenarioOutcome | null {
  if (!comparison || comparison.relationToReference === "equal") {
    return null
  }

  return {
    description: getStrategyOutcomeDescription(comparison.selectedStrategy),
    key: comparison.selectedStrategy,
    label: `Compared with ${getStrategyComparisonLabel(comparison.referenceStrategy)}`,
    valueLabel:
      comparison.relationToReference === "lower"
        ? "less projected value at target"
        : "more projected value at target",
    value: Math.abs(comparison.deltaFromReference),
  }
}

function getStrategyComparisonLabel(strategy: ReinvestmentStrategy) {
  switch (strategy) {
    case REINVESTMENT_STRATEGIES.keepAsCash:
      return "holding as cash"
    case REINVESTMENT_STRATEGIES.reinvest:
      return "reinvesting"
    case REINVESTMENT_STRATEGIES.strict:
      return "excluding"
  }
}

function getStrategyOutcomeDescription(strategy: ReinvestmentStrategy) {
  switch (strategy) {
    case REINVESTMENT_STRATEGIES.keepAsCash:
      return "The matured balance stays in the projection as cash, but stops earning after maturity."
    case REINVESTMENT_STRATEGIES.reinvest:
      return "The matured balance is reinvested at the current rate."
    case REINVESTMENT_STRATEGIES.strict:
      return "The matured balance is excluded from the projection at maturity."
  }
}
