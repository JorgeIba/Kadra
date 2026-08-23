import { ArrowUpRight, Repeat } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { OpenEndedInvestmentSummary } from "@/domain/investments"
import { MoneyAmount } from "@/app/components/MoneyAmount"
import { formatPercentage } from "@/lib/formatters"
import { cn } from "@/lib/utils"

interface OpenEndedInvestmentCardProps {
  investment: OpenEndedInvestmentSummary
  density?: "default" | "relaxed"
  onSelect?: (investmentId: string) => void
}

export function OpenEndedInvestmentCard({
  density = "default",
  investment,
  onSelect,
}: OpenEndedInvestmentCardProps) {
  const { t } = useTranslation()

  return (
    <article
      className={cn(
        "grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 rounded-lg border border-transparent transition-[transform,color,background-color,border-color] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:transition-none",
        density === "relaxed" ? "gap-y-4 px-3 py-5" : "-mx-3 gap-y-3 px-3 py-4",
        onSelect === undefined
          ? "cursor-default"
          : "group/investment cursor-pointer hover:-translate-y-px hover:border-primary/10 hover:bg-secondary/45 hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:translate-y-px active:border-primary/10 active:bg-secondary/60",
      )}
      role={onSelect === undefined ? undefined : "button"}
      tabIndex={onSelect === undefined ? undefined : 0}
      onClick={() => onSelect?.(investment.id)}
      onKeyDown={(event) => {
        if (onSelect === undefined) {
          return
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelect(investment.id)
        }
      }}
    >
      <Repeat
        className="size-5 shrink-0 text-muted-foreground transition-[color,transform] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/investment:-translate-y-px group-hover/investment:text-primary group-active/investment:text-primary motion-reduce:transform-none"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="font-ledger truncate text-base text-foreground">
          {investment.name}
        </p>
        <p className="mt-1.5 truncate text-xs text-muted-foreground">
          {investment.institutionName} · {t("investment.cards.annualRate")}{" "}
          {formatPercentage(investment.annualRate)}
        </p>
      </div>
      <div className="col-start-2 text-right">
        <p className="font-ledger text-lg leading-none text-foreground tabular-nums">
          <MoneyAmount value={investment.estimatedCurrentValue} />
        </p>
        <p className="mt-2 inline-flex items-center gap-1 rounded-full border border-info-border bg-info-surface px-2 py-1 text-xs text-info">
          {t("investment.cards.liquid")}{" "}
          <ArrowUpRight
            className="size-3 transition-transform duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/investment:translate-x-0.5 group-hover/investment:-translate-y-0.5 group-active/investment:translate-x-0.5 group-active/investment:-translate-y-0.5 motion-reduce:transform-none"
            aria-hidden="true"
          />
        </p>
      </div>
    </article>
  )
}
