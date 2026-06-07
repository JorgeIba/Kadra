import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMxn } from "@/lib/formatters"

interface PortfolioSummaryCardProps {
  totalValue: number
  dailyCashFlow: number
  investmentCount: number
}

export function PortfolioSummaryCard({
  totalValue,
  dailyCashFlow,
  investmentCount,
}: PortfolioSummaryCardProps) {
  return (
    <Card className="rounded-lg bg-secondary/70">
      <CardHeader>
        <CardTitle className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Total portfolio value
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-7">
        <h1 className="font-ledger text-[2.7rem] font-normal leading-none tracking-normal text-foreground">
          {formatMxn(totalValue)}
        </h1>

        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2">
            <p className="text-xs leading-none text-muted-foreground">
              Daily flow
            </p>
            <p className="font-ledger text-xl leading-none text-primary">
              {formatMxn(dailyCashFlow)}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs leading-none text-muted-foreground">
              Holdings
            </p>
            <p className="font-ledger text-xl leading-none text-foreground">
              {investmentCount}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
