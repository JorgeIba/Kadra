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
      className="group/investment -mx-3 flex cursor-pointer items-center gap-4 rounded-lg border border-transparent px-3 py-4 transition-[transform,color,background-color,border-color] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:border-primary/10 hover:bg-secondary/45 hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:translate-y-px active:border-primary/10 active:bg-secondary/60 motion-reduce:transform-none motion-reduce:transition-none"
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
        className="size-5 shrink-0 text-muted-foreground transition-[color,transform] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/investment:-translate-y-px group-hover/investment:text-primary group-active/investment:text-primary motion-reduce:transform-none"
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
          Liquid{" "}
          <ArrowUpRight
            className="size-3 transition-transform duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/investment:translate-x-0.5 group-hover/investment:-translate-y-0.5 group-active/investment:translate-x-0.5 group-active/investment:-translate-y-0.5 motion-reduce:transform-none"
            aria-hidden="true"
          />
        </p>
      </div>
    </article>
  )
}
