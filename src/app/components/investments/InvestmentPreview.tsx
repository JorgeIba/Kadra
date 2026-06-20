import {
  DAY_COUNTS,
  getUpcomingInvestmentProjectedEarningsForDays,
  INVESTMENT_TYPES,
  resolveInvestment,
  type Investment,
} from "@/domain/investments"
import { Card, CardContent } from "@/components/ui/card"
import { formatMxn, formatPercentage } from "@/lib/formatters"

interface InvestmentPreviewProps {
  investment: Investment
  asOfDate?: Date
}

export function InvestmentPreview({
  asOfDate = new Date(),
  investment,
}: InvestmentPreviewProps) {
  const resolvedInvestment = resolveInvestment(investment, asOfDate)

  return (
    <Card className="border-dashed bg-secondary/40">
      <CardContent className="space-y-3">
        <p className="text-sm font-medium">Projection preview</p>
        <div className="grid grid-cols-2 gap-3">
          <PreviewMetric
            label="Estimated current value"
            value={formatMxn(resolvedInvestment.estimatedCurrentValue)}
          />
          <PreviewMetric
            label="Estimated periodic return"
            value={formatMxn(resolvedInvestment.estimatedPeriodicReturn)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <PreviewMetric
            label="Estimated monthly return"
            value={formatMxn(
              getUpcomingInvestmentProjectedEarningsForDays(
                investment,
                DAY_COUNTS.month,
                asOfDate,
              ),
            )}
          />
          <PreviewMetric
            label="Estimated yearly return"
            value={formatMxn(
              getUpcomingInvestmentProjectedEarningsForDays(
                investment,
                DAY_COUNTS.year,
                asOfDate,
              ),
            )}
          />
        </div>

        {resolvedInvestment.type === INVESTMENT_TYPES.fixedTerm ? (
          <div className="grid grid-cols-2 gap-3">
            <PreviewMetric
              label="Projected maturity value"
              value={formatMxn(resolvedInvestment.projectedValueAtEndDate)}
            />
            <PreviewMetric
              label="Term progress"
              value={formatPercentage(resolvedInvestment.progressPercentage)}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background/70 p-3">
      <p className="text-xs leading-5 text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}
