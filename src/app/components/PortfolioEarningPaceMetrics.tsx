import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useShouldAnimateOnMount } from "@/app/routing/navigation-animation"
import { formatMxn } from "@/lib/formatters"

export interface PortfolioEarningPace {
  daily: number
  monthly: number
  yearly: number
}

interface PortfolioEarningPaceMetricsProps {
  pace: PortfolioEarningPace
  title: string
  description?: string
}

const EARNING_PACE_ITEMS = [
  { key: "daily", label: "Per day" },
  { key: "monthly", label: "Per month" },
  { key: "yearly", label: "Per year" },
] as const

export function PortfolioEarningPaceMetrics({
  description,
  pace,
  title,
}: PortfolioEarningPaceMetricsProps) {
  const prefersReducedMotion = useReducedMotion() ?? false
  const shouldAnimateOnMount = useShouldAnimateOnMount()

  return (
    <div className="space-y-3 border-t border-border/70 pt-4">
      <div className="space-y-1">
        <h3 className="text-balance text-base font-bold leading-tight text-foreground">
          {title}
        </h3>
        {description === undefined ? null : (
          <p className="text-pretty text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      <div className="divide-y divide-border/65 rounded-lg border border-border/70 bg-background/30">
        {EARNING_PACE_ITEMS.map((item) => (
          <div
            key={item.key}
            className="flex items-baseline justify-between gap-4 px-3 py-2.5"
          >
            <p className="text-xs leading-none text-muted-foreground">
              {item.label}
            </p>
            <AnimatedPaceValue
              prefersReducedMotion={prefersReducedMotion}
              shouldAnimateOnMount={shouldAnimateOnMount}
              value={pace[item.key]}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function AnimatedPaceValue({
  prefersReducedMotion,
  shouldAnimateOnMount,
  value,
}: {
  prefersReducedMotion: boolean
  shouldAnimateOnMount: boolean
  value: number
}) {
  const formattedValue = formatMxn(value)

  if (prefersReducedMotion) {
    return (
      <p className="font-ledger text-lg leading-none text-foreground tabular-nums">
        {formattedValue}
      </p>
    )
  }

  return (
    <div className="relative min-h-5 overflow-hidden">
      <AnimatePresence mode="popLayout" initial={shouldAnimateOnMount}>
        <motion.p
          key={formattedValue}
          className="font-ledger text-lg leading-none text-foreground tabular-nums"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
        >
          {formattedValue}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
