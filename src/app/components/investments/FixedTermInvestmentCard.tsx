import { Landmark } from "lucide-react"
import type { FixedTermInvestmentSummary } from "@/domain/investments"
import { Card, CardContent } from "@/components/ui/card"
import { formatMxn, formatPercentage } from "@/lib/formatters"

interface FixedTermInvestmentCardProps {
  investment: FixedTermInvestmentSummary
  onSelect?: (investmentId: string) => void
}

export function FixedTermInvestmentCard({
  investment,
  onSelect,
}: FixedTermInvestmentCardProps) {
  return (
    <Card
      size="sm"
      className="rounded-lg transition-colors hover:bg-muted/40"
      role={onSelect === undefined ? undefined : "button"}
      tabIndex={onSelect === undefined ? undefined : 0}
      onClick={() => onSelect?.(investment.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelect?.(investment.id)
        }
      }}
    >
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
          <p className="text-xs text-muted-foreground">
            {Math.round(investment.progressPercentage)}%
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
