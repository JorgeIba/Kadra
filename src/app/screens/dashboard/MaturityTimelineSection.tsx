import { CalendarClock } from "lucide-react"
import { DashboardSectionHeader } from "@/app/screens/dashboard/DashboardSectionHeader"
import type { MaturityTimelineItem } from "@/app/screens/dashboard/maturity-timeline"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MaturityTimelineSectionProps {
  maturityTimelineItems: MaturityTimelineItem[]
  onInvestmentSelect: (investmentId: string) => void
}

export function MaturityTimelineSection({
  maturityTimelineItems,
  onInvestmentSelect,
}: MaturityTimelineSectionProps) {
  if (maturityTimelineItems.length === 0) {
    return null
  }

  return (
    <section className="space-y-4">
      <DashboardSectionHeader title="Upcoming maturities" />

      <div className="divide-y divide-border/70 border-t border-border/70">
        {maturityTimelineItems.map((item) => (
          <Button
            key={item.id}
            type="button"
            variant="ghost"
            className="group/timeline h-auto w-full justify-start rounded-lg border border-transparent px-3 py-4 text-left hover:border-primary/10 hover:bg-secondary/45 active:border-primary/10 active:bg-secondary/60"
            onClick={() => onInvestmentSelect(item.id)}
          >
            <CalendarClock
              className="mt-1 size-4 shrink-0 text-muted-foreground transition-[color,transform] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/timeline:-translate-y-px group-hover/timeline:text-primary group-active/timeline:text-primary motion-reduce:transform-none"
              aria-hidden="true"
            />
            <span className="grid min-w-0 flex-1 gap-1 pl-4">
              <span className="font-ledger truncate text-base font-normal text-foreground">
                {item.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {item.institutionName} · Ends {item.endDate}
              </span>
            </span>
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-bold transition-colors duration-180 ease-[cubic-bezier(0.22,1,0.36,1)]",
                getMaturityBadgeClassName(item.daysRemaining),
              )}
            >
              In {item.daysRemaining} days
            </span>
          </Button>
        ))}
      </div>
    </section>
  )
}

function getMaturityBadgeClassName(daysRemaining: number) {
  if (daysRemaining <= 30) {
    return "border-warning-border bg-warning-surface text-warning group-hover/timeline:bg-warning-surface/80 group-active/timeline:bg-warning-surface/70"
  }

  if (daysRemaining <= 90) {
    return "border-info-border bg-info-surface text-info group-hover/timeline:bg-info-surface/80 group-active/timeline:bg-info-surface/70"
  }

  return "border-status-neutral-border bg-status-neutral-surface text-status-neutral group-hover/timeline:bg-status-neutral-surface/80 group-active/timeline:bg-status-neutral-surface/70"
}
