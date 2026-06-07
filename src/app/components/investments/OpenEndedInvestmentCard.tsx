import { ArrowUpRight, Repeat } from "lucide-react"
import type { OpenEndedInvestmentSummary } from "@/domain/investments"
import { formatMxn, formatPercentage } from "@/lib/formatters"

interface OpenEndedInvestmentCardProps {
  investment: OpenEndedInvestmentSummary
  onSelect?: (investmentId: string) => void
}

export function OpenEndedInvestmentCard({
  investment,
  onSelect,
}: OpenEndedInvestmentCardProps) {
  return (
    <article
      className="flex cursor-pointer items-center gap-4 py-4 transition-colors hover:text-foreground"
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
      <Repeat
        className="size-5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="font-ledger truncate text-base text-foreground">
          {investment.name}
        </p>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {investment.institutionName} · Annual rate{" "}
          {formatPercentage(investment.annualRate)}
        </p>
      </div>
      <div className="text-right">
        <p className="font-ledger text-sm font-bold text-foreground">
          {formatMxn(investment.estimatedCurrentValue)}
        </p>
        <p className="mt-1 inline-flex items-center gap-1 text-xs text-primary">
          Liquid <ArrowUpRight className="size-3" aria-hidden="true" />
        </p>
      </div>
    </article>
  )
}
