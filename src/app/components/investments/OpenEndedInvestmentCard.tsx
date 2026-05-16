import { ArrowUpRight, Repeat } from "lucide-react"
import type { OpenEndedInvestmentSummary } from "@/domain/investments"
import { Card, CardContent } from "@/components/ui/card"
import { formatMxn, formatPercentage } from "@/lib/formatters"

interface OpenEndedInvestmentCardProps {
  investment: OpenEndedInvestmentSummary
}

export function OpenEndedInvestmentCard({
  investment,
}: OpenEndedInvestmentCardProps) {
  return (
    <Card size="sm" className="rounded-lg">
      <CardContent className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground">
          <Repeat className="size-5" aria-hidden="true" />
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
          <ArrowUpRight
            className="ml-auto size-4 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
      </CardContent>
    </Card>
  )
}
