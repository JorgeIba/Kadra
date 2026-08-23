import type { PortfolioEarnedMoneySnapshot } from "@/app/screens/earnings/earnings-view-model"
import { MoneyAmount } from "@/app/components/MoneyAmount"
import { DashboardActionHint } from "@/app/screens/dashboard/DashboardActionHint"
import { DashboardSectionHeader } from "@/app/screens/dashboard/DashboardSectionHeader"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"

interface EarningsExplorationCardProps {
  snapshot: PortfolioEarnedMoneySnapshot
  onOpenDetails: () => void
}

export function EarningsExplorationCard({
  snapshot,
  onOpenDetails,
}: EarningsExplorationCardProps) {
  const { t } = useTranslation()

  return (
    <button
      type="button"
      className="group/earnings-card -mx-3 block w-[calc(100%+1.5rem)] rounded-lg border-y border-border/70 px-3 py-5 text-left outline-none transition-[background-color] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-secondary/25 focus-visible:ring-3 focus-visible:ring-ring/50 active:bg-secondary/40"
      onClick={onOpenDetails}
    >
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <DashboardSectionHeader
            title={t("dashboard.earnings.title")}
            description={t("dashboard.earnings.description")}
          />
          <DashboardActionHint
            className="mt-1"
            iconClassName="group-hover/earnings-card:translate-x-0.5 group-active/earnings-card:translate-x-0.5"
          >
            {t("dashboard.earnings.openReport")}
          </DashboardActionHint>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          <PreviewMetric
            label={t("dashboard.earnings.earnedReturn")}
            value={<MoneyAmount value={snapshot.totalEarnedAmount} />}
          />
          <PreviewMetric
            label={t("dashboard.earnings.trackedInvestments")}
            value={String(snapshot.investmentCount)}
          />
          <PreviewMetric
            label={t("dashboard.earnings.active")}
            value={String(snapshot.activeInvestmentCount)}
          />
          <PreviewMetric
            label={t("dashboard.earnings.finished")}
            value={String(snapshot.finishedInvestmentCount)}
          />
        </div>
      </div>
    </button>
  )
}

function PreviewMetric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-2 border-t border-border/60 pt-3 nth-child(-n+2):border-t-0 nth-child(-n+2):pt-0">
      <p className="text-xs leading-none text-muted-foreground">{label}</p>
      <p className="font-ledger text-lg leading-none text-foreground tabular-nums">
        {value}
      </p>
    </div>
  )
}
