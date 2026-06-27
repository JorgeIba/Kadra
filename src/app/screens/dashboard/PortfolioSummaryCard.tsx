import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMxn } from "@/lib/formatters"

interface PortfolioSummaryCardProps {
  activeInvestments: number
  earnedSoFar: number
  totalValue: number
}

export function PortfolioSummaryCard({
  activeInvestments,
  earnedSoFar,
  totalValue,
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
              Active investments
            </p>
            <p className="font-ledger text-xl leading-none text-success tabular-nums">
              {activeInvestments}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs leading-none text-muted-foreground">
              Earned so far
            </p>
            <p className="font-ledger text-xl leading-none text-foreground">
              {formatMxn(earnedSoFar)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
