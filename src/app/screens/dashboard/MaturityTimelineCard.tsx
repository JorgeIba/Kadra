import { CalendarClock } from "lucide-react"
import type { MaturityTimelineItem } from "@/app/screens/dashboard/maturity-timeline"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface MaturityTimelineCardProps {
  maturityTimelineItems: MaturityTimelineItem[]
  onInvestmentSelect: (investmentId: string) => void
}

export function MaturityTimelineCard({
  maturityTimelineItems,
  onInvestmentSelect,
}: MaturityTimelineCardProps) {
  if (maturityTimelineItems.length === 0) {
    return null
  }

  return (
    <Card className="rounded-lg">
      <CardContent className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Upcoming maturities</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Fixed-term investments ending soonest.
          </p>
        </div>

        <div className="space-y-2">
          {maturityTimelineItems.map((item) => (
            <Button
              key={item.id}
              type="button"
              variant="ghost"
              className="h-auto w-full justify-start rounded-lg border bg-background px-3 py-3 text-left hover:bg-muted/40"
              onClick={() => onInvestmentSelect(item.id)}
            >
              <CalendarClock
                className="mt-0.5 size-4 text-primary"
                aria-hidden="true"
              />
              <span className="grid flex-1 gap-1">
                <span className="text-sm font-semibold text-foreground">
                  {item.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.institutionName} · Ends {item.endDate}
                </span>
              </span>
              <span className="text-right text-xs font-medium text-muted-foreground">
                {item.daysRemaining} days
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
