import {
  DAY_COUNTS,
  getUpcomingInvestmentProjectedEarningsForDays,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  PAYMENT_FREQUENCY_LABELS,
  resolveInvestment,
  type Investment,
} from "@/domain/investments"
import { MoneyAmount } from "@/app/components/MoneyAmount"
import { Card, CardContent } from "@/components/ui/card"
import { formatDisplayDate } from "@/lib/formatters"
import type { ReactNode } from "react"

interface InvestmentPreviewProps {
  investment: Investment
  asOfDate?: Date
}

export function InvestmentPreview({
  asOfDate = new Date(),
  investment,
}: InvestmentPreviewProps) {
  const resolvedInvestment = resolveInvestment(investment, asOfDate)
  const isFixedTerm = resolvedInvestment.type === INVESTMENT_TYPES.fixedTerm
  const isPaidAtMaturity =
    resolvedInvestment.paymentFrequency === PAYMENT_FREQUENCIES.atMaturity
  const paymentFrequency =
    PAYMENT_FREQUENCY_LABELS[resolvedInvestment.paymentFrequency]
  const paymentFrequencyLabel = paymentFrequency.toLowerCase()

  return (
    <Card className="border-border/80 bg-card/55">
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <p className="text-sm font-bold">Projection preview</p>
          <p className="text-sm leading-6 text-muted-foreground">
            Estimated from the amount, rate, dates, and return settings above.
          </p>
        </div>

        <div className="border-y border-border/70 py-4">
          <p className="text-xs leading-none text-muted-foreground">
            {isFixedTerm
              ? `At maturity · ${formatDisplayDate(resolvedInvestment.endDate)}`
              : "Estimated value today"}
          </p>
          <p className="mt-2 font-ledger text-3xl leading-none text-foreground tabular-nums">
            <MoneyAmount
              value={
                isFixedTerm
                  ? resolvedInvestment.projectedValueAtEndDate
                  : resolvedInvestment.estimatedCurrentValue
              }
            />
          </p>
          {isFixedTerm ? (
            <p className="mt-2 text-sm leading-5 text-muted-foreground">
              <MoneyAmount
                value={resolvedInvestment.projectedTotalReturnAtEndDate}
              />{" "}
              estimated return
            </p>
          ) : null}
          {isFixedTerm && resolvedInvestment.daysRemaining <= 90 ? (
            <p className="mt-3 text-xs font-medium leading-5 text-muted-foreground">
              {formatMaturityCountdown(resolvedInvestment.daysRemaining)}
            </p>
          ) : null}
        </div>

        {isPaidAtMaturity ? null : (
          <div className="space-y-3">
            <p className="text-xs font-medium leading-none text-muted-foreground">
              Return cadence
            </p>
            <div className="grid grid-cols-2 divide-x divide-border/70">
              <PreviewMetric
                label={`Periodic return · paid ${paymentFrequencyLabel}`}
                value={
                  <MoneyAmount
                    value={resolvedInvestment.estimatedPeriodicReturn}
                  />
                }
              />
              <PreviewMetric
                label="Monthly return"
                value={
                  <MoneyAmount
                    value={getUpcomingInvestmentProjectedEarningsForDays(
                      investment,
                      DAY_COUNTS.month,
                      asOfDate,
                    )}
                  />
                }
              />
            </div>
            <div className="border-t border-border/70 pt-3">
              <PreviewMetric
                label="Yearly return"
                value={
                  <MoneyAmount
                    value={getUpcomingInvestmentProjectedEarningsForDays(
                      investment,
                      DAY_COUNTS.year,
                      asOfDate,
                    )}
                  />
                }
              />
            </div>
          </div>
        )}

        {isFixedTerm ? (
          <div className="grid grid-cols-2 divide-x divide-border/70 border-t border-border/70 pt-4">
            <PreviewMetric
              label="Initial contribution"
              value={<MoneyAmount value={resolvedInvestment.originalAmount} />}
            />
            <PreviewMetric
              label="Return paid"
              value={paymentFrequency}
              description={isPaidAtMaturity ? "No interim payouts" : undefined}
            />
          </div>
        ) : (
          <div className="border-t border-border/70 pt-4">
            <PreviewMetric label="Term" value="Open ended" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function formatMaturityCountdown(daysRemaining: number): string {
  if (daysRemaining === 0) {
    return "Matures today"
  }

  if (daysRemaining === 1) {
    return "Matures in 1 day"
  }

  return `Matures in ${daysRemaining} days`
}

function PreviewMetric({
  description,
  label,
  value,
}: {
  description?: ReactNode
  label: string
  value: ReactNode
}) {
  return (
    <div className="min-w-0 px-3 first:pl-0 last:pr-0">
      <p className="text-xs leading-5 text-muted-foreground">{label}</p>
      <p className="truncate font-ledger text-lg leading-6 text-foreground tabular-nums">
        {value}
      </p>
      {description === undefined ? null : (
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  )
}
