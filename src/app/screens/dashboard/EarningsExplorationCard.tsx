import { ArrowRight } from "lucide-react"
import type { PortfolioEarningsSnapshot } from "@/domain/investments"
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
      className="block w-full text-left"
      onClick={onOpenDetails}
    >
      <Card className="rounded-lg transition-colors hover:bg-secondary/40">
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <DashboardSectionHeader
              title="Earnings"
              description="Compare what is coming next with what a full period can produce."
            />
            <ArrowRight
              className="mt-1 size-4 shrink-0 text-muted-foreground"
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
    <div className="space-y-2 rounded-lg bg-background/40 px-3 py-3">
      <p className="text-xs leading-none text-muted-foreground">{label}</p>
      <p className="font-ledger text-lg leading-none text-foreground tabular-nums">
        {formatMxn(value)}
      </p>
    </div>
  )
}
