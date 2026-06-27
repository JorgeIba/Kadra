import type {
  PortfolioBreakdown,
  PortfolioBreakdownItem,
} from "@/app/screens/dashboard/portfolio-breakdown"
import { AnimatedProgressBar } from "@/app/components/AnimatedProgressBar"
import { DashboardSectionHeader } from "@/app/screens/dashboard/DashboardSectionHeader"
import { Card, CardContent } from "@/components/ui/card"
import { formatMxn, formatPercentage } from "@/lib/formatters"

interface PortfolioBreakdownCardProps {
  breakdown: PortfolioBreakdown
}

export function PortfolioBreakdownCard({
  breakdown,
}: PortfolioBreakdownCardProps) {
  return (
    <Card className="rounded-lg">
      <CardContent className="space-y-6">
        <DashboardSectionHeader
          title="Distribution"
          description="Allocation of your active capital assets."
        />

        <BreakdownSection title="By type" items={breakdown.byType} />
        <BreakdownSection title="By status" items={breakdown.byStatus} />
      </CardContent>
    </Card>
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
          <BreakdownRow key={item.label} item={item} />
        ))}
      </div>
    </div>
  )
}

function BreakdownRow({ item }: { item: PortfolioBreakdownItem }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-ledger text-base text-foreground">{item.label}</p>
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
      <AnimatedProgressBar value={item.percentage} />
    </div>
  )
}
