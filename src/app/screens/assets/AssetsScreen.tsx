import {
  getInvestmentSummary,
  getPortfolioEstimatedCurrentValue,
  type Investment,
} from "@/domain/investments"
import { InvestmentCard } from "@/app/components/investments/InvestmentCard"
import { formatMxn } from "@/lib/formatters"

interface AssetsScreenProps {
  investments: Investment[]
}

export function AssetsScreen({ investments }: AssetsScreenProps) {
  const asOfDate = new Date()
  const totalValue = getPortfolioEstimatedCurrentValue(investments, asOfDate)
  const investmentSummaries = investments.map((investment) =>
    getInvestmentSummary(investment, asOfDate),
  )

  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Assets</p>
        <h1 className="text-3xl font-semibold tracking-normal">
          All investments
        </h1>
      </div>

      <div className="rounded-lg border bg-card px-4 py-3 text-card-foreground">
        <p className="text-sm text-muted-foreground">Current total value</p>
        <p className="mt-1 text-2xl font-semibold">{formatMxn(totalValue)}</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Investment list</h2>
          <span className="text-sm font-medium text-muted-foreground">
            {investmentSummaries.length} total
          </span>
        </div>

        <div className="space-y-3">
          {investmentSummaries.map((investment) => (
            <InvestmentCard key={investment.id} investment={investment} />
          ))}
        </div>
      </div>
    </section>
  )
}
