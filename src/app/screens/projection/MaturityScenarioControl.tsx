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

interface MaturityScenarioControlProps {
  excludedValue: number
  maturedCash: number
  onStrategyCommit: (strategy: ReinvestmentStrategy) => void
  strategy: ReinvestmentStrategy
}

interface MaturityScenarioOutcome {
  description: string
  key: ReinvestmentStrategy
  label: string
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
  excludedValue,
  maturedCash,
  onStrategyCommit,
  strategy,
}: MaturityScenarioControlProps) {
  const outcome = deriveProjectionStrategyOutcome({
    excludedValue,
    maturedCash,
    strategy,
  })
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
            className="flex items-start justify-between gap-4 border-t border-warning-border/65 pt-4"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {outcome.label}
              </p>
              <p className="text-sm leading-5 text-muted-foreground">
                {outcome.description}
              </p>
            </div>
            <p className="shrink-0 font-ledger text-xl leading-none text-warning tabular-nums">
              <MoneyAmount value={outcome.value} />
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}

function deriveProjectionStrategyOutcome({
  excludedValue,
  maturedCash,
  strategy,
}: {
  excludedValue: number
  maturedCash: number
  strategy: ReinvestmentStrategy
}): MaturityScenarioOutcome | null {
  if (strategy === REINVESTMENT_STRATEGIES.keepAsCash && maturedCash > 0) {
    return {
      description: "Included in the projected value, but no longer earning.",
      key: strategy,
      label: "Held as cash at target",
      value: maturedCash,
    }
  }

  if (strategy === REINVESTMENT_STRATEGIES.strict && excludedValue > 0) {
    return {
      description: "Not included in the projected value.",
      key: strategy,
      label: "Excluded at maturity",
      value: excludedValue,
    }
  }

  return null
}
