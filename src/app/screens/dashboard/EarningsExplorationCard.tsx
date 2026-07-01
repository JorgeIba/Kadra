import type { PortfolioEarnedMoneySnapshot } from "@/app/screens/earnings/earnings-view-model"
import { DashboardActionHint } from "@/app/screens/dashboard/DashboardActionHint"
import { DashboardSectionHeader } from "@/app/screens/dashboard/DashboardSectionHeader"
import { formatMxn } from "@/lib/formatters"

interface EarningsExplorationCardProps {
  snapshot: PortfolioEarnedMoneySnapshot
  onOpenDetails: () => void
}

export function EarningsExplorationCard({
  snapshot,
  onOpenDetails,
}: EarningsExplorationCardProps) {
  return (
    <button
      type="button"
      className="group/earnings-card -mx-3 block w-[calc(100%+1.5rem)] rounded-lg border-y border-border/70 px-3 py-5 text-left outline-none transition-[background-color] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-secondary/25 focus-visible:ring-3 focus-visible:ring-ring/50 active:bg-secondary/40"
      onClick={onOpenDetails}
    >
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <DashboardSectionHeader
            title="Accrued earnings"
            description="Estimated return produced through today, including finished investments."
          />
          <DashboardActionHint
            className="mt-1"
            iconClassName="group-hover/earnings-card:translate-x-0.5 group-active/earnings-card:translate-x-0.5"
          >
            Open report
          </DashboardActionHint>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          <PreviewMetric
            label="Earned return"
            value={formatMxn(snapshot.totalEarnedAmount)}
          />
          <PreviewMetric
            label="Tracked investments"
            value={String(snapshot.investmentCount)}
          />
          <PreviewMetric
            label="Active"
            value={String(snapshot.activeInvestmentCount)}
          />
          <PreviewMetric
            label="Finished"
            value={String(snapshot.finishedInvestmentCount)}
          />
        </div>
      </div>
    </button>
  )
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2 border-t border-border/60 pt-3 nth-child(-n+2):border-t-0 nth-child(-n+2):pt-0">
      <p className="text-xs leading-none text-muted-foreground">{label}</p>
      <p className="font-ledger text-lg leading-none text-foreground tabular-nums">
        {value}
      </p>
    </div>
  )
}
