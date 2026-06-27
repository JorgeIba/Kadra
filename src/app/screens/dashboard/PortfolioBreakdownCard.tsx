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
import { Button } from "@/components/ui/button"
import { DashboardSectionHeader } from "@/app/screens/dashboard/DashboardSectionHeader"
import { formatMxn, formatPercentage } from "@/lib/formatters"
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
        title="Distribution"
        description="Allocation of active capital by investment type and status."
      />

      <BreakdownSection
        title="By type"
        items={breakdown.byType}
        onOpenFilter={onOpenFilter}
      />
      <BreakdownSection
        title="By status"
        items={breakdown.byStatus}
        onOpenFilter={onOpenFilter}
      />
    </section>
  )
}

function BreakdownSection({
  items,
  onOpenFilter,
  title,
}: {
  items: PortfolioBreakdownItem[]
  onOpenFilter: (filterOption: AssetFilterOption) => void
  title: string
}) {
  return (
    <div className="space-y-3">
      <h3 className="border-b border-border/70 pb-3 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-5">
        {items.map((item) => (
          <BreakdownRow
            key={item.label}
            item={item}
            onOpenFilter={onOpenFilter}
            sectionTitle={title}
          />
        ))}
      </div>
    </div>
  )
}

function BreakdownRow({
  item,
  onOpenFilter,
  sectionTitle,
}: {
  item: PortfolioBreakdownItem
  onOpenFilter: (filterOption: AssetFilterOption) => void
  sectionTitle: string
}) {
  const tone = getBreakdownTone(sectionTitle, item.label)
  const filterOption = getBreakdownFilterOption(sectionTitle, item.label)

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
              {formatMxn(item.estimatedValue)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(item.percentage)}
            </p>
          </div>
        </div>
        <AnimatedProgressBar tone={tone} value={item.percentage} />
      </div>
    </Button>
  )
}

function getBreakdownFilterOption(
  sectionTitle: string,
  itemLabel: string,
): AssetFilterOption {
  if (sectionTitle === "By type") {
    return itemLabel === "Open ended"
      ? ASSET_FILTER_OPTIONS.openEnded
      : ASSET_FILTER_OPTIONS.fixedTerm
  }

  return itemLabel === "Active"
    ? ASSET_FILTER_OPTIONS.active
    : ASSET_FILTER_OPTIONS.finished
}

function getBreakdownTone(
  sectionTitle: string,
  itemLabel: string,
): ProgressTone {
  if (sectionTitle === "By type") {
    return itemLabel === "Open ended" ? "info" : "warning"
  }

  return itemLabel === "Active" ? "success" : "neutral"
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
