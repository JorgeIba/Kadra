import { ArrowRight } from "lucide-react"
import { PortfolioProjectionLineChart } from "@/app/components/PortfolioProjectionLineChart"
import { DashboardSectionHeader } from "@/app/screens/dashboard/DashboardSectionHeader"
import type { PortfolioProjectionPoint } from "@/app/screens/dashboard/portfolio-projection"
import { Card, CardContent } from "@/components/ui/card"

interface PortfolioProjectionChartProps {
  points: PortfolioProjectionPoint[]
  onOpenDetails?: () => void
}

export function PortfolioProjectionChart({
  onOpenDetails,
  points,
}: PortfolioProjectionChartProps) {
  const content = (
    <Card
      className={
        onOpenDetails === undefined
          ? "rounded-lg"
          : "rounded-lg border border-transparent transition-[transform,background-color,border-color,box-shadow] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/projection-card:-translate-y-px group-hover/projection-card:border-primary/10 group-hover/projection-card:bg-secondary/40 group-focus-visible/projection-card:border-ring group-focus-visible/projection-card:ring-3 group-focus-visible/projection-card:ring-ring/50 group-active/projection-card:translate-y-px group-active/projection-card:border-primary/10 group-active/projection-card:bg-secondary/55 motion-reduce:transform-none motion-reduce:transition-none"
      }
    >
      <CardContent className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <DashboardSectionHeader
            title="Growth forecast"
            description="Estimate future value from the current portfolio."
          />
          {onOpenDetails === undefined ? null : (
            <ArrowRight
              className="mt-1 size-4 shrink-0 text-muted-foreground transition-[color,transform] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/projection-card:translate-x-0.5 group-hover/projection-card:text-primary group-active/projection-card:translate-x-0.5 group-active/projection-card:text-primary motion-reduce:transform-none"
              aria-hidden="true"
            />
          )}
        </div>

        <PortfolioProjectionLineChart points={points} />
      </CardContent>
    </Card>
  )

  if (onOpenDetails === undefined) {
    return content
  }

  return (
    <button
      type="button"
      aria-label="Open projection calculator"
      className="group/projection-card block w-full rounded-lg text-left outline-none"
      onClick={onOpenDetails}
    >
      {content}
    </button>
  )
}
