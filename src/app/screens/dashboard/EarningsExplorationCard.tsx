import { ArrowRight } from "lucide-react"
import type { PortfolioEarningsSnapshot } from "@/app/screens/earnings/earnings-view-model"
import { DashboardSectionHeader } from "@/app/screens/dashboard/DashboardSectionHeader"
import { Card, CardContent } from "@/components/ui/card"
import { formatMxn } from "@/lib/formatters"

interface EarningsExplorationCardProps {
  snapshot: PortfolioEarningsSnapshot
  onOpenDetails: () => void
}

export function EarningsExplorationCard({
  snapshot,
  onOpenDetails,
}: EarningsExplorationCardProps) {
  return (
    <button
      type="button"
      className="group/earnings-card block w-full rounded-lg text-left outline-none"
      onClick={onOpenDetails}
    >
      <Card className="rounded-lg border border-transparent transition-[transform,background-color,border-color,box-shadow] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/earnings-card:-translate-y-px group-hover/earnings-card:border-primary/10 group-hover/earnings-card:bg-secondary/40 group-focus-visible/earnings-card:border-ring group-focus-visible/earnings-card:ring-3 group-focus-visible/earnings-card:ring-ring/50 group-active/earnings-card:translate-y-px group-active/earnings-card:border-primary/10 group-active/earnings-card:bg-secondary/55 motion-reduce:transform-none motion-reduce:transition-none">
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <DashboardSectionHeader
              title="Earnings"
              description="Compare what is coming next with what a full period can produce."
            />
            <ArrowRight
              className="mt-1 size-4 shrink-0 text-muted-foreground transition-[color,transform] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/earnings-card:translate-x-0.5 group-hover/earnings-card:text-primary group-active/earnings-card:translate-x-0.5 group-active/earnings-card:text-primary motion-reduce:transform-none"
              aria-hidden="true"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <PreviewMetric
              label="Upcoming 1 day"
              value={snapshot.upcoming.totals.daily}
            />
            <PreviewMetric
              label="Period 1 day"
              value={snapshot.period.totals.daily}
            />
            <PreviewMetric
              label="Upcoming 30 days"
              value={snapshot.upcoming.totals.monthly}
            />
            <PreviewMetric
              label="Period 30 days"
              value={snapshot.period.totals.monthly}
            />
          </div>
        </CardContent>
      </Card>
    </button>
  )
}

function PreviewMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2 rounded-lg bg-background/40 px-3 py-3 transition-colors duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/earnings-card:bg-background/55 group-active/earnings-card:bg-background/60">
      <p className="text-xs leading-none text-muted-foreground">{label}</p>
      <p className="font-ledger text-lg leading-none text-foreground tabular-nums">
        {formatMxn(value)}
      </p>
    </div>
  )
}
