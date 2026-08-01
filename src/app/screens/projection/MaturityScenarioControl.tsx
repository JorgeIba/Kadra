import { useState } from "react"
import { MinusCircle, RefreshCw, Wallet } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import {
  ExpandingChoicePicker,
  type ExpandingChoicePickerOption,
} from "@/app/components/ExpandingChoicePicker"
import { MoneyAmount } from "@/app/components/MoneyAmount"
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

type MaturityScenarioPhase =
  | "settled"
  | "hiding-outcome-before-picker"
  | "picker-active"

const OUTCOME_TRANSITION = {
  duration: 0.18,
  ease: [0.22, 1, 0.36, 1],
  type: "tween",
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
  const outcome = deriveMaturityScenarioOutcome({
    excludedValue,
    maturedCash,
    strategy,
  })
  const [phase, setPhase] = useState<MaturityScenarioPhase>("settled")
  const isPickerOpeningAuthorized = phase === "picker-active"
  const isOutcomeVisible = phase === "settled"

  function handlePickerOpenRequest() {
    if (phase !== "settled") {
      return
    }

    // Keep the picker collapsed until an existing outcome finishes exiting,
    // or open it immediately when there is no outcome to dismiss.
    setPhase(
      outcome === null ? "picker-active" : "hiding-outcome-before-picker",
    )
  }

  function handleOutcomeExitComplete() {
    if (phase !== "hiding-outcome-before-picker") {
      return
    }

    setPhase("picker-active")
  }

  function handlePickerCloseComplete() {
    if (phase !== "picker-active") {
      return
    }

    setPhase("settled")
  }

  return (
    <div className="border-t border-border/70 py-4">
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-foreground">
          Maturity scenario
        </h2>
        <ExpandingChoicePicker
          ariaLabel="Maturity scenario"
          legend="Choose a maturity scenario"
          isOpeningAuthorized={isPickerOpeningAuthorized}
          onCloseComplete={handlePickerCloseComplete}
          onOpenRequest={handlePickerOpenRequest}
          onValueCommit={onStrategyCommit}
          options={MATURITY_SCENARIO_OPTIONS}
          value={strategy}
        />
      </div>
      <ProjectionStrategyOutcome
        isVisible={isOutcomeVisible}
        outcome={outcome}
        onExitComplete={handleOutcomeExitComplete}
      />
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
  const shouldShowOutcome = isVisible && outcome !== null

  return (
    // Animate the real flow height so the Value path reflows with the outcome
    // instead of snapping while a transform-only layout animation is running.
    <motion.div
      aria-live={shouldShowOutcome ? "polite" : undefined}
      aria-atomic="true"
      animate={{ height: shouldShowOutcome ? "auto" : 0 }}
      className="overflow-hidden"
      initial={false}
      transition={prefersReducedMotion ? { duration: 0 } : OUTCOME_TRANSITION}
    >
      <AnimatePresence initial={false} onExitComplete={onExitComplete}>
        {shouldShowOutcome ? (
          <motion.div
            key={outcome.key}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={
              prefersReducedMotion ? { duration: 0 } : OUTCOME_TRANSITION
            }
            className="mt-3 flex items-start justify-between gap-4 border-t border-warning-border/65 pt-4"
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

/**
 * Derives the note produced by the committed maturity strategy. `null` means
 * that the current strategy has no idle or excluded value worth calling out.
 */
function deriveMaturityScenarioOutcome({
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
