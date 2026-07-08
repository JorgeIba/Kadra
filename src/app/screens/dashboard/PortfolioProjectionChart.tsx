import {
  PortfolioEarningPaceMetrics,
  type PortfolioEarningPace,
} from "@/app/components/PortfolioEarningPaceMetrics"
import { MoneyAmount } from "@/app/components/MoneyAmount"
import { PortfolioProjectionLineChart } from "@/app/components/PortfolioProjectionLineChart"
import { DashboardActionHint } from "@/app/screens/dashboard/DashboardActionHint"
import { DashboardSectionHeader } from "@/app/screens/dashboard/DashboardSectionHeader"
import type { PortfolioProjectionPoint } from "@/app/screens/dashboard/portfolio-projection"
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
            <DashboardActionHint
              className="mt-1"
              iconClassName="group-hover/projection-card:translate-x-0.5 group-active/projection-card:translate-x-0.5"
            >
              Open report
            </DashboardActionHint>
          )}
        </div>

        {targetPoint === undefined ? null : (
          <div className="space-y-1">
            <p className="font-ledger text-2xl leading-none text-foreground tabular-nums">
              <MoneyAmount value={targetPoint.estimatedValue} />
            </p>
            <p className="text-xs leading-5 text-muted-foreground">
              <MoneyAmount value={targetPoint.projectedEarnings} /> projected
              earnings
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
