import { ArrowUpRight, Landmark, WalletCards } from "lucide-react"
import {
  INVESTMENT_TYPES,
  getInvestmentSummary,
  getPortfolioEstimatedCurrentValue,
  getPortfolioEstimatedDailyReturn,
  type Investment,
} from "@/domain/investments"
import { Card, CardContent } from "@/components/ui/card"
import { formatMxn, formatPercentage } from "@/lib/formatters"

interface DashboardScreenProps {
  investments: Investment[]
}

const DASHBOARD_INVESTMENT_PREVIEW_LIMIT = 3

export function DashboardScreen({ investments }: DashboardScreenProps) {
  const asOfDate = new Date()
  const totalValue = getPortfolioEstimatedCurrentValue(investments, asOfDate)
  const dailyCashFlow = getPortfolioEstimatedDailyReturn(investments)
  const investmentSummaries = investments
    .map((investment) => getInvestmentSummary(investment, asOfDate))
    .slice(0, DASHBOARD_INVESTMENT_PREVIEW_LIMIT)

  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Dashboard</p>
        <h1 className="text-3xl font-semibold tracking-normal">
          Portfolio snapshot
        </h1>
      </div>

      <Card className="border-none bg-primary text-primary-foreground shadow-xl shadow-emerald-950/10 ring-0">
        <CardContent className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-primary-foreground/70">Total value</p>
              <p className="mt-2 text-4xl font-semibold tracking-normal">
                {formatMxn(totalValue)}
              </p>
            </div>
            <div className="grid size-10 place-items-center rounded-lg bg-primary-foreground/10">
              <WalletCards className="size-5" aria-hidden="true" />
            </div>
          </div>

          <div className="rounded-lg bg-primary-foreground/10 px-4 py-3">
            <p className="text-xs font-medium uppercase text-primary-foreground/60">
              Estimated daily cash flow
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {formatMxn(dailyCashFlow)}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Active investments</h2>
          <span className="text-sm font-medium text-muted-foreground">
            {investments.length} total
          </span>
        </div>

        <div className="space-y-3">
          {investmentSummaries.map((investment) => (
            <Card key={investment.id} size="sm" className="rounded-lg">
              <CardContent className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                  <Landmark className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{investment.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {investment.institutionName} ·{" "}
                    {formatPercentage(investment.annualRate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatMxn(investment.estimatedCurrentValue)}
                  </p>
                  {investment.type === INVESTMENT_TYPES.fixedTerm ? (
                    <p className="text-xs text-muted-foreground">
                      {Math.round(investment.progressPercentage)}%
                    </p>
                  ) : (
                    <ArrowUpRight
                      className="ml-auto size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
