import { ArrowRight } from "lucide-react"
import {
  PortfolioEarningPaceMetrics,
  type PortfolioEarningPace,
} from "@/app/components/PortfolioEarningPaceMetrics"
import { PortfolioProjectionLineChart } from "@/app/components/PortfolioProjectionLineChart"
import { DashboardSectionHeader } from "@/app/screens/dashboard/DashboardSectionHeader"
import type { PortfolioProjectionPoint } from "@/app/screens/dashboard/portfolio-projection"
import { formatMxn } from "@/lib/formatters"
import { cn } from "@/lib/utils"

interface PortfolioProjectionChartProps {
  earningPace: PortfolioEarningPace
  points: PortfolioProjectionPoint[]
  onOpenDetails?: () => void
}

export function PortfolioProjectionChart({
  earningPace,
  onOpenDetails,
  points,
}: PortfolioProjectionChartProps) {
  const targetPoint = points.at(-1)

  return (
    <section
      role={onOpenDetails === undefined ? undefined : "button"}
      tabIndex={onOpenDetails === undefined ? undefined : 0}
      className={cn(
        "border-y border-border/70 py-5",
        onOpenDetails !== undefined &&
          "group/projection-card -mx-3 w-[calc(100%+1.5rem)] cursor-pointer rounded-lg px-3 transition-[background-color] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-secondary/25 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:bg-secondary/40",
      )}
      onClick={onOpenDetails}
      onKeyDown={(event) => {
        if (
          onOpenDetails !== undefined &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault()
          onOpenDetails()
        }
      }}
    >
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <DashboardSectionHeader
            title="1-year projection"
            description="Based on current investments and rates, with no future contributions."
          />
          {onOpenDetails === undefined ? null : (
            <span className="mt-1 inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary">
              Open projection
              <ArrowRight
                className="size-4 transition-transform duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/projection-card:translate-x-0.5 group-active/projection-card:translate-x-0.5 motion-reduce:transform-none"
                aria-hidden="true"
              />
            </span>
          )}
        </div>

        {targetPoint === undefined ? null : (
          <div className="space-y-1">
            <p className="font-ledger text-2xl leading-none text-foreground tabular-nums">
              {formatMxn(targetPoint.estimatedValue)}
            </p>
            <p className="text-xs leading-5 text-muted-foreground">
              {formatMxn(targetPoint.projectedEarnings)} projected earnings
            </p>
          </div>
        )}

        <div
          className="cursor-default"
          onClick={(event) => event.stopPropagation()}
        >
          <PortfolioProjectionLineChart points={points} />
        </div>

        <PortfolioEarningPaceMetrics
          title="Earning pace today"
          pace={earningPace}
        />
      </div>
    </section>
  )
}
