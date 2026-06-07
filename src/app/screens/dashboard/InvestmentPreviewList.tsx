import type { InvestmentSummary } from "@/domain/investments"
import { InvestmentCard } from "@/app/components/investments/InvestmentCard"
import { DashboardSectionHeader } from "@/app/screens/dashboard/DashboardSectionHeader"

interface InvestmentPreviewListProps {
  investments: InvestmentSummary[]
  totalInvestmentCount: number
  onInvestmentSelect: (investmentId: string) => void
}

export function InvestmentPreviewList({
  investments,
  totalInvestmentCount,
  onInvestmentSelect,
}: InvestmentPreviewListProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <DashboardSectionHeader title="Active assets" />
        <span className="text-xs font-medium text-muted-foreground">
          {totalInvestmentCount} total
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
