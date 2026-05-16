import type { InvestmentSummary } from "@/domain/investments"
import { InvestmentCard } from "@/app/components/investments/InvestmentCard"

interface InvestmentPreviewListProps {
  investments: InvestmentSummary[]
  totalInvestmentCount: number
}

export function InvestmentPreviewList({
  investments,
  totalInvestmentCount,
}: InvestmentPreviewListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Active investments</h2>
        <span className="text-sm font-medium text-muted-foreground">
          {totalInvestmentCount} total
        </span>
      </div>

      <div className="space-y-3">
        {investments.map((investment) => (
          <InvestmentCard key={investment.id} investment={investment} />
        ))}
      </div>
    </div>
  )
}
