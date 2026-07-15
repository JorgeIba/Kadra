import {
  DAY_COUNTS,
  getUpcomingInvestmentProjectedEarningsForDays,
  INVESTMENT_TYPES,
  resolveInvestment,
  type Investment,
} from "@/domain/investments"
import { MoneyAmount } from "@/app/components/MoneyAmount"
import { Card, CardContent } from "@/components/ui/card"
import { formatPercentage } from "@/lib/formatters"
import type { ReactNode } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

interface InvestmentPreviewProps {
  investment: Investment
  asOfDate?: Date
}

export function InvestmentPreview({
  asOfDate = new Date(),
  investment,
}: InvestmentPreviewProps) {
  const resolvedInvestment = resolveInvestment(investment, asOfDate)
  const periodicReturn = resolvedInvestment.estimatedPeriodicReturn
  const monthlyReturn = getUpcomingInvestmentProjectedEarningsForDays(
    investment,
    DAY_COUNTS.month,
    asOfDate,
  )
  const yearlyReturn = getUpcomingInvestmentProjectedEarningsForDays(
    investment,
    DAY_COUNTS.year,
    asOfDate,
  )

  return (
    <Card className="border-border/80 bg-card/55">
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <p className="text-sm font-bold">Projection preview</p>
          <p className="text-sm leading-6 text-muted-foreground">
            Estimated from the amount, rate, dates, and return settings above.
          </p>
        </div>

        <div className="border-y border-border/70 py-4">
          <p className="text-xs leading-none text-muted-foreground">
            Initial contribution
          </p>
          <p className="mt-2 font-ledger text-3xl leading-none text-foreground tabular-nums">
            <AnimatedPreviewValue
              valueKey={resolvedInvestment.estimatedCurrentValue}
            >
              <MoneyAmount value={resolvedInvestment.estimatedCurrentValue} />
            </AnimatedPreviewValue>
          </p>
        </div>

        <div className="grid grid-cols-2 divide-x divide-border/70 border-b border-border/70 pb-4">
          <PreviewMetric
            label="Periodic return"
            value={<MoneyAmount value={periodicReturn} />}
            valueKey={periodicReturn}
          />
          <PreviewMetric
            label="Monthly return"
            value={<MoneyAmount value={monthlyReturn} />}
            valueKey={monthlyReturn}
          />
        </div>

        <div className="grid grid-cols-2 divide-x divide-border/70">
          <PreviewMetric
            label="Yearly return"
            value={<MoneyAmount value={yearlyReturn} />}
            valueKey={yearlyReturn}
          />

          {resolvedInvestment.type === INVESTMENT_TYPES.fixedTerm ? (
            <PreviewMetric
              label="Maturity value"
              value={
                <MoneyAmount
                  value={resolvedInvestment.projectedValueAtEndDate}
                />
              }
              valueKey={resolvedInvestment.projectedValueAtEndDate}
            />
          ) : (
            <PreviewMetric
              label="Term"
              value="Open ended"
              valueKey="open-ended"
            />
          )}
        </div>

        {resolvedInvestment.type === INVESTMENT_TYPES.fixedTerm ? (
          <div className="border-t border-border/70 pt-4">
            <PreviewMetric
              label="Term progress"
              value={formatPercentage(resolvedInvestment.progressPercentage)}
              valueKey={resolvedInvestment.progressPercentage}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function PreviewMetric({
  label,
  value,
  valueKey,
}: {
  label: string
  value: ReactNode
  valueKey: number | string
}) {
  return (
    <div className="min-w-0 px-3 first:pl-0 last:pr-0">
      <p className="text-xs leading-5 text-muted-foreground">{label}</p>
      <p className="truncate font-ledger text-lg leading-6 text-foreground tabular-nums">
        <AnimatedPreviewValue valueKey={valueKey}>{value}</AnimatedPreviewValue>
      </p>
    </div>
  )
}

function AnimatedPreviewValue({
  children,
  valueKey,
}: {
  children: ReactNode
  valueKey: number | string
}) {
  const prefersReducedMotion = useReducedMotion() ?? false

  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.span
        key={valueKey}
        className="block"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={prefersReducedMotion ? undefined : { opacity: 0, y: -2 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.16,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  )
}
