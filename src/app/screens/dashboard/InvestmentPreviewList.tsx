import type { InvestmentSummary } from "@/domain/investments"
import { InvestmentCard } from "@/app/components/investments/InvestmentCard"
import { DashboardSectionHeader } from "@/app/screens/dashboard/DashboardSectionHeader"
import { useTranslation } from "react-i18next"

interface InvestmentPreviewListProps {
  activeInvestmentCount: number
  investments: InvestmentSummary[]
  onInvestmentSelect: (investmentId: string) => void
}

export function InvestmentPreviewList({
  activeInvestmentCount,
  investments,
  onInvestmentSelect,
}: InvestmentPreviewListProps) {
  const { t } = useTranslation()

  if (investments.length === 0) {
    return null
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <DashboardSectionHeader title={t("dashboard.activeAssets.title")} />
        <span className="text-xs font-medium text-muted-foreground">
          {t("dashboard.activeAssets.activeCount", {
            count: activeInvestmentCount,
          })}
        </span>
      </div>

      <div className="divide-y divide-border/70 border-t border-border/70">
        {investments.map((investment) => (
          <InvestmentCard
            key={investment.id}
            investment={investment}
            onSelect={onInvestmentSelect}
          />
        ))}
      </div>
    </section>
  )
}
