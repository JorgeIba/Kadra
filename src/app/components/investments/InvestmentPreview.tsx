import {
  compareCalendarDatesAscending,
  DAY_COUNTS,
  getUpcomingInvestmentProjectedEarningsForDays,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  resolveInvestment,
  toDateString,
  type Investment,
} from "@/domain/investments"
import { getPaymentFrequencyLabels } from "@/app/i18n/labels"
import { useLocale } from "@/app/i18n"
import { useTranslation } from "react-i18next"
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
  const { t } = useTranslation()
  const { activeLocale } = useLocale()
  const resolvedInvestment = resolveInvestment(investment, asOfDate)
  const isFixedTerm = resolvedInvestment.type === INVESTMENT_TYPES.fixedTerm
  const isPaidAtMaturity =
    resolvedInvestment.paymentFrequency === PAYMENT_FREQUENCIES.atMaturity
  const paymentFrequencyLabels = getPaymentFrequencyLabels(t)
  const paymentFrequency =
    paymentFrequencyLabels[resolvedInvestment.paymentFrequency]
  const asOfDateString = toDateString(asOfDate)
  const shouldShowMaturityCountdown =
    isFixedTerm &&
    compareCalendarDatesAscending(asOfDateString, resolvedInvestment.endDate) <=
      0 &&
    resolvedInvestment.daysRemaining <= 90
  const maturityCountdown = isFixedTerm
    ? resolvedInvestment.daysRemaining === 0
      ? t("investment.preview.maturityCountdown.today")
      : t("investment.preview.maturityCountdown.inDays", {
          count: resolvedInvestment.daysRemaining,
        })
    : null

  return (
    <Card className="border-border/80 bg-card/55">
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <p className="text-sm font-bold">
            {t("investment.preview.projectionPreview")}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {t("investment.preview.description")}
          </p>
        </div>

        <div className="border-y border-border/70 py-4">
          <p className="text-xs leading-none text-muted-foreground">
            {isFixedTerm
              ? t("investment.preview.atMaturity", {
                  date: formatDisplayDate(
                    resolvedInvestment.endDate,
                    activeLocale,
                  ),
                })
              : t("investment.preview.estimatedValueToday")}
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
              {t("investment.preview.estimatedReturn")}
            </p>
          ) : null}
          {shouldShowMaturityCountdown ? (
            <p className="mt-3 text-xs font-medium leading-5 text-muted-foreground">
              {maturityCountdown}
            </p>
          ) : null}
        </div>

        {isPaidAtMaturity ? null : (
          <div className="space-y-3">
            <p className="text-xs font-medium leading-none text-muted-foreground">
              {t("investment.preview.returnCadence")}
            </p>
            <div className="grid grid-cols-2 divide-x divide-border/70">
              <PreviewMetric
                label={t("investment.preview.periodicReturn", {
                  frequency: paymentFrequency.toLowerCase(),
                })}
                value={
                  <MoneyAmount
                    value={resolvedInvestment.estimatedPeriodicReturn}
                  />
                }
              />
              <PreviewMetric
                label={t("investment.preview.monthlyReturn")}
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
                label={t("investment.preview.yearlyReturn")}
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
              label={t("investment.preview.initialContribution")}
              value={<MoneyAmount value={resolvedInvestment.originalAmount} />}
            />
            <PreviewMetric
              label={t("investment.preview.returnPaid")}
              value={paymentFrequency}
              description={
                isPaidAtMaturity
                  ? t("investment.preview.noInterimPayouts")
                  : undefined
              }
            />
          </div>
        ) : (
          <div className="border-t border-border/70 pt-4">
            <PreviewMetric
              label={t("investment.preview.term")}
              value={t("investment.preview.openEnded")}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
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
