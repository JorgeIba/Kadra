import type {
  PortfolioBreakdown,
  PortfolioBreakdownItem,
} from "@/app/screens/dashboard/portfolio-breakdown"
import {
  AnimatedProgressBar,
  type ProgressTone,
} from "@/app/components/AnimatedProgressBar"
import { DashboardSectionHeader } from "@/app/screens/dashboard/DashboardSectionHeader"
import { formatMxn, formatPercentage } from "@/lib/formatters"
import { cn } from "@/lib/utils"

interface PortfolioBreakdownCardProps {
  breakdown: PortfolioBreakdown
}

export function PortfolioBreakdownCard({
  breakdown,
}: PortfolioBreakdownCardProps) {
  return (
    <section className="space-y-6 border-y border-border/70 py-5">
      <DashboardSectionHeader
        title="Distribution"
        description="Allocation of active capital by investment type and status."
      />

      <BreakdownSection title="By type" items={breakdown.byType} />
      <BreakdownSection title="By status" items={breakdown.byStatus} />
    </section>
  )
}

function BreakdownSection({
  items,
  title,
}: {
  items: PortfolioBreakdownItem[]
  title: string
}) {
  return (
    <div className="space-y-3">
      <h3 className="border-b border-border/70 pb-3 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-5">
        {items.map((item) => (
          <BreakdownRow key={item.label} item={item} sectionTitle={title} />
        ))}
      </div>
    </div>
  )
}

function BreakdownRow({
  item,
  sectionTitle,
}: {
  item: PortfolioBreakdownItem
  sectionTitle: string
}) {
  const tone = getBreakdownTone(sectionTitle, item.label)

  return (
    <div className="space-y-3">
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
  )
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
