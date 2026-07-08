import { MoneyAmount } from "@/app/components/MoneyAmount"

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
            <AnimatedPaceValue value={pace[item.key]} />
          </div>
        ))}
      </div>
    </div>
  )
}

function AnimatedPaceValue({ value }: { value: number }) {
  return (
    <p className="font-ledger text-lg leading-none text-foreground tabular-nums">
      <MoneyAmount value={value} />
    </p>
  )
}
