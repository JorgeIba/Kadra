import type {
  PortfolioBreakdown,
  PortfolioBreakdownItem,
} from "@/app/screens/dashboard/portfolio-breakdown"
import {
  ASSET_FILTER_OPTIONS,
  type AssetFilterOption,
} from "@/app/screens/assets/assets-filtering"
import {
  AnimatedProgressBar,
  type ProgressTone,
} from "@/app/components/AnimatedProgressBar"
import { MoneyAmount } from "@/app/components/MoneyAmount"
import { Button } from "@/components/ui/button"
import { DashboardSectionHeader } from "@/app/screens/dashboard/DashboardSectionHeader"
import { formatPercentage } from "@/lib/formatters"
import { cn } from "@/lib/utils"

interface PortfolioBreakdownCardProps {
  breakdown: PortfolioBreakdown
  onOpenFilter: (filterOption: AssetFilterOption) => void
}

export function PortfolioBreakdownCard({
  breakdown,
  onOpenFilter,
}: PortfolioBreakdownCardProps) {
  return (
    <section className="space-y-6 border-y border-border/70 py-5">
      <DashboardSectionHeader
        title="Active capital"
        description="Share of active value by investment type."
      />

      <BreakdownSection
        items={breakdown.activeCapitalByType}
        onOpenFilter={onOpenFilter}
      />
    </section>
  )
}

function BreakdownSection({
  items,
  onOpenFilter,
}: {
  items: PortfolioBreakdownItem[]
  onOpenFilter: (filterOption: AssetFilterOption) => void
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        No active capital to distribute.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      {items.map((item) => (
        <BreakdownRow
          key={item.label}
          item={item}
          onOpenFilter={onOpenFilter}
        />
      ))}
    </div>
  )
}

function BreakdownRow({
  item,
  onOpenFilter,
}: {
  item: PortfolioBreakdownItem
  onOpenFilter: (filterOption: AssetFilterOption) => void
}) {
  const tone = getBreakdownTone(item.label)
  const filterOption = getBreakdownFilterOption(item.label)

  return (
    <Button
      type="button"
      variant="ghost"
      className="-mx-3 h-auto w-[calc(100%+1.5rem)] justify-start rounded-lg border border-transparent px-3 py-3 text-left hover:border-primary/10 hover:bg-secondary/35 active:border-primary/10 active:bg-secondary/50"
      onClick={() => onOpenFilter(filterOption)}
    >
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={cn("size-2 rounded-full", getToneDotClassName(tone))}
                aria-hidden="true"
              />
              <p className="font-ledger text-base text-foreground">
                {item.label}
              </p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {item.count} investment{item.count === 1 ? "" : "s"}
            </p>
          </div>
          <div className="text-right">
            <p className="font-ledger text-sm font-bold text-foreground tabular-nums">
              <MoneyAmount value={item.estimatedValue} />
            </p>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(item.percentage, {
                maximumFractionDigits: 0,
              })}{" "}
              of active value
            </p>
          </div>
        </div>
        <AnimatedProgressBar tone={tone} value={item.percentage} />
      </div>
    </Button>
  )
}

function getBreakdownFilterOption(itemLabel: string): AssetFilterOption {
  return itemLabel === "Open ended"
    ? ASSET_FILTER_OPTIONS.openEnded
    : ASSET_FILTER_OPTIONS.fixedTerm
}

function getBreakdownTone(itemLabel: string): ProgressTone {
  return itemLabel === "Open ended" ? "info" : "warning"
}

const TONE_DOT_CLASS_NAMES: Record<ProgressTone, string> = {
  info: "bg-info",
  neutral: "bg-status-neutral",
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
}

function getToneDotClassName(tone: ProgressTone) {
  return TONE_DOT_CLASS_NAMES[tone]
}
