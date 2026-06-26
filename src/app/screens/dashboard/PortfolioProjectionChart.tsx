import { ArrowRight } from "lucide-react"
import {
  PortfolioEarningPaceMetrics,
  type PortfolioEarningPace,
} from "@/app/components/PortfolioEarningPaceMetrics"
import { PortfolioProjectionLineChart } from "@/app/components/PortfolioProjectionLineChart"
import { DashboardSectionHeader } from "@/app/screens/dashboard/DashboardSectionHeader"
import type { PortfolioProjectionPoint } from "@/app/screens/dashboard/portfolio-projection"
import { Card, CardContent } from "@/components/ui/card"
import { formatMxn } from "@/lib/formatters"

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
    <Card
      role={onOpenDetails === undefined ? undefined : "button"}
      tabIndex={onOpenDetails === undefined ? undefined : 0}
      className={
        onOpenDetails === undefined
          ? "rounded-lg"
          : "group/projection-card cursor-pointer rounded-lg border border-transparent transition-[transform,background-color,border-color,box-shadow] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:border-primary/10 hover:bg-secondary/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px active:border-primary/10 active:bg-secondary/55 motion-reduce:transform-none motion-reduce:transition-none"
      }
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
      <CardContent className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <DashboardSectionHeader
            title="1-year projection"
            description="Estimate future value from the current portfolio."
          />
          {onOpenDetails === undefined ? null : (
            <ArrowRight
              className="mt-1 size-4 shrink-0 text-muted-foreground transition-[color,transform] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/projection-card:translate-x-0.5 group-hover/projection-card:text-primary group-active/projection-card:translate-x-0.5 group-active/projection-card:text-primary motion-reduce:transform-none"
              aria-hidden="true"
            />
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
      </CardContent>
    </Card>
  )
}
