import type {
  PortfolioBreakdown,
  PortfolioBreakdownItem,
} from "@/app/screens/dashboard/portfolio-breakdown"
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
      <CardContent className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold">Portfolio breakdown</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            See how your estimated value is distributed.
          </p>
        </div>

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
      <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <BreakdownRow key={item.label} item={item} />
        ))}
      </div>
    </div>
  )
}

function BreakdownRow({ item }: { item: PortfolioBreakdownItem }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{item.label}</p>
          <p className="text-xs text-muted-foreground">
            {item.count} investment{item.count === 1 ? "" : "s"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">
            {formatMxn(item.estimatedValue)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatPercentage(item.percentage)}
          </p>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${item.percentage}%` }}
        />
      </div>
    </div>
  )
}
