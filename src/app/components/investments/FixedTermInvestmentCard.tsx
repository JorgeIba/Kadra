import { Landmark } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { FixedTermInvestmentSummary } from "@/domain/investments"
import { AnimatedProgressBar } from "@/app/components/AnimatedProgressBar"
import { MoneyAmount } from "@/app/components/MoneyAmount"
import { formatPercentage } from "@/lib/formatters"
import { cn } from "@/lib/utils"

interface FixedTermInvestmentCardProps {
  investment: FixedTermInvestmentSummary
  density?: "default" | "relaxed"
  onSelect?: (investmentId: string) => void
}

export function FixedTermInvestmentCard({
  density = "default",
  investment,
  onSelect,
}: FixedTermInvestmentCardProps) {
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
      <Landmark
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
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1">
            <AnimatedProgressBar value={investment.progressPercentage} />
          </div>
          <p className="text-xs text-muted-foreground">
            {Math.round(investment.progressPercentage)}%
          </p>
        </div>
      </div>
    </article>
  )
}
