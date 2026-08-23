import { MinusCircle, RefreshCw, Wallet } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { TFunction } from "i18next"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import {
  ExpandingChoicePicker,
  type ExpandingChoicePickerOption,
} from "@/app/components/expanding-choice-picker/ExpandingChoicePicker"
import { MoneyAmount } from "@/app/components/MoneyAmount"
import { usePickerWithDependentContent } from "@/app/components/expanding-choice-picker/use-picker-with-dependent-content"
import { getReinvestmentStrategyOptionLabels } from "@/app/i18n/labels"
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

function getMaturityScenarioOptions(t: TFunction) {
  const strategyLabels = getReinvestmentStrategyOptionLabels(t)

  return [
    {
      value: REINVESTMENT_STRATEGIES.reinvest,
      label: strategyLabels[REINVESTMENT_STRATEGIES.reinvest],
      summary: t("projection.maturityScenario.options.reinvest.summary"),
      description: t(
        "projection.maturityScenario.options.reinvest.description",
      ),
      compactDescription: t(
        "projection.maturityScenario.options.reinvest.compactDescription",
      ),
      icon: RefreshCw,
    },
    {
      value: REINVESTMENT_STRATEGIES.keepAsCash,
      label: strategyLabels[REINVESTMENT_STRATEGIES.keepAsCash],
      summary: t("projection.maturityScenario.options.keepAsCash.summary"),
      description: t(
        "projection.maturityScenario.options.keepAsCash.description",
      ),
      compactDescription: t(
        "projection.maturityScenario.options.keepAsCash.compactDescription",
      ),
      icon: Wallet,
    },
    {
      value: REINVESTMENT_STRATEGIES.strict,
      label: strategyLabels[REINVESTMENT_STRATEGIES.strict],
      summary: t("projection.maturityScenario.options.strict.summary"),
      description: t("projection.maturityScenario.options.strict.description"),
      compactDescription: t(
        "projection.maturityScenario.options.strict.compactDescription",
      ),
      icon: MinusCircle,
    },
  ] satisfies readonly ExpandingChoicePickerOption<ReinvestmentStrategy>[]
}

export function MaturityScenarioControl({
  comparison,
  onStrategyCommit,
  strategy,
}: MaturityScenarioControlProps) {
  const { t } = useTranslation()
  const outcome = deriveProjectionStrategyOutcome(comparison, t)
  const maturityScenarioOptions = getMaturityScenarioOptions(t)
  const pickerInteraction = usePickerWithDependentContent({
    hasVisibleDependentContent: outcome !== null,
  })

  return (
    <div className="border-t border-border/70 py-4">
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-foreground">
          {t("projection.maturityScenario.title")}
        </h2>
        <ExpandingChoicePicker
          ariaLabel={t("projection.maturityScenario.ariaLabel")}
          canStartPendingOpening={
            pickerInteraction.canStartPendingPickerOpening
          }
          legend={t("projection.maturityScenario.legend")}
          onCloseComplete={pickerInteraction.onPickerCloseComplete}
          onOpenRequest={pickerInteraction.onPickerOpenRequest}
          onValueCommit={onStrategyCommit}
          options={maturityScenarioOptions}
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
  t: TFunction,
): MaturityScenarioOutcome | null {
  if (!comparison || comparison.relationToReference === "equal") {
    return null
  }

  return {
    description: getStrategyOutcomeDescription(comparison.selectedStrategy, t),
    key: comparison.selectedStrategy,
    label: t("projection.maturityScenario.comparison", {
      strategy: getStrategyComparisonLabel(comparison.referenceStrategy, t),
    }),
    valueLabel:
      comparison.relationToReference === "lower"
        ? t("projection.maturityScenario.lessProjectedValueAtTarget")
        : t("projection.maturityScenario.moreProjectedValueAtTarget"),
    value: Math.abs(comparison.deltaFromReference),
  }
}

function getStrategyComparisonLabel(
  strategy: ReinvestmentStrategy,
  t: TFunction,
) {
  switch (strategy) {
    case REINVESTMENT_STRATEGIES.keepAsCash:
      return t("projection.maturityScenario.referenceStrategies.keepAsCash")
    case REINVESTMENT_STRATEGIES.reinvest:
      return t("projection.maturityScenario.referenceStrategies.reinvest")
    case REINVESTMENT_STRATEGIES.strict:
      return t("projection.maturityScenario.referenceStrategies.strict")
  }
}

function getStrategyOutcomeDescription(
  strategy: ReinvestmentStrategy,
  t: TFunction,
) {
  switch (strategy) {
    case REINVESTMENT_STRATEGIES.keepAsCash:
      return t("projection.maturityScenario.descriptions.keepAsCash")
    case REINVESTMENT_STRATEGIES.reinvest:
      return t("projection.maturityScenario.descriptions.reinvest")
    case REINVESTMENT_STRATEGIES.strict:
      return t("projection.maturityScenario.descriptions.strict")
  }
}
