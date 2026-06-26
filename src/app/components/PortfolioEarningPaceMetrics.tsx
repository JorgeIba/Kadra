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
  return (
    <div className="space-y-3 border-t border-border/70 pt-4">
      <div className="space-y-1">
        <h3 className="text-sm font-bold leading-tight text-foreground">
          {title}
        </h3>
        {description === undefined ? null : (
          <p className="text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-3">
        {EARNING_PACE_ITEMS.map((item) => (
          <div key={item.key} className="rounded-lg bg-secondary/45 px-3 py-3">
            <p className="text-xs leading-none text-muted-foreground">
              {item.label}
            </p>
            <p className="mt-2 font-ledger text-base leading-none text-foreground tabular-nums">
              {formatMxn(pace[item.key])}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
