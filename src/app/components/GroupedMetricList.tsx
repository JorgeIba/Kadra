import type { CSSProperties, ReactNode } from "react"
import { Collapsible } from "@base-ui/react/collapsible"
import { ChevronDown } from "lucide-react"
import type {
  BreakdownGroup,
  BreakdownItem,
  GroupTotalMetric,
} from "@/app/shared/grouping"
import { formatPercentage } from "@/lib/formatters"
import { cn } from "@/lib/utils"

interface GroupedMetricListProps<TItem> {
  groups: BreakdownGroup<TItem>[]
  formatMetric: (value: number) => string
  itemNoun: string
  renderItem: (item: BreakdownItem<TItem>) => ReactNode
  itemListClassName?: string
  sectionClassName?: string
  showShareOfTotal?: boolean
}

export function GroupedMetricList<TItem>({
  formatMetric,
  groups,
  itemListClassName,
  itemNoun,
  renderItem,
  sectionClassName,
  showShareOfTotal = false,
}: GroupedMetricListProps<TItem>) {
  return (
    <div className="space-y-4">
      {groups.map((group, index) => (
        <Collapsible.Root
          key={group.key}
          defaultOpen
          render={
            <section
              style={
                {
                  "--motion-index": Math.min(index, 6),
                } as CSSProperties
              }
              className={cn(
                "motion-list-item overflow-hidden rounded-lg border border-border/70 bg-background/30 transition-colors hover:border-border",
                sectionClassName,
              )}
            />
          }
        >
          <GroupedMetricHeader
            count={group.items.length}
            formatMetric={formatMetric}
            groupLabel={group.label}
            itemNoun={itemNoun}
            metric={group.totalMetric}
            showShareOfTotal={showShareOfTotal}
          />
          <Collapsible.Panel className="grouped-metric-panel border-t border-border/60">
            <div className={cn("p-3", itemListClassName)}>
              {group.items.map((item) => renderItem(item))}
            </div>
          </Collapsible.Panel>
        </Collapsible.Root>
      ))}
    </div>
  )
}

function GroupedMetricHeader({
  count,
  formatMetric,
  groupLabel,
  itemNoun,
  metric,
  showShareOfTotal,
}: {
  count: number
  formatMetric: (value: number) => string
  groupLabel: string
  itemNoun: string
  metric: GroupTotalMetric
  showShareOfTotal: boolean
}) {
  return (
    <Collapsible.Trigger className="group flex w-full items-center justify-between gap-4 px-3 py-3 text-left outline-none transition-colors hover:bg-muted/30 focus-visible:ring-3 focus-visible:ring-ring/50">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-md border border-border/70 bg-muted/35 text-muted-foreground transition-colors group-hover:border-primary/20 group-hover:text-primary group-data-[panel-open]:text-primary">
          <ChevronDown
            className="size-4 transition-transform duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[panel-open]:rotate-180 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-ledger text-base text-foreground">
            {groupLabel}
          </h3>
          <p className="mt-1 text-xs leading-none text-muted-foreground">
            {count} {itemNoun}
            {count === 1 ? "" : "s"}
          </p>
        </div>
      </div>
      <div className="shrink-0 rounded-md bg-muted/25 px-2 py-1.5 text-right ring-1 ring-border/50">
        <span className="block text-xs text-muted-foreground">
          {metric.label}
        </span>
        <span className="block font-ledger text-sm font-bold text-foreground tabular-nums">
          {formatMetric(metric.value)}
        </span>
        {showShareOfTotal && metric.shareOfTotal !== undefined ? (
          <span className="block text-xs text-muted-foreground">
            {formatPercentage(metric.shareOfTotal)}
          </span>
        ) : null}
      </div>
    </Collapsible.Trigger>
  )
}
