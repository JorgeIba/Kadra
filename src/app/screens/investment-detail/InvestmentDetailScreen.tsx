import { useState, type ReactNode } from "react"
import { useTranslation } from "react-i18next"
import {
  Landmark,
  Pencil,
  Percent,
  PlusCircle,
  TrendingUp,
  Trash2,
  WalletCards,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { ConfirmDialog } from "@/app/components/ConfirmDialog"
import { useLocale } from "@/app/i18n"
import {
  getInvestmentTypeLabels,
  getPaymentFrequencyLabels,
  getReinvestmentBehaviorLabels,
} from "@/app/i18n/labels"
import { MoneyAmount } from "@/app/components/MoneyAmount"
import { ScreenIntro } from "@/app/components/ScreenIntro"
import {
  DAY_COUNTS,
  INVESTMENT_TYPES,
  getUpcomingInvestmentProjectedEarningsForDays,
  resolveInvestment,
  type Investment,
} from "@/domain/investments"
import { Button } from "@/components/ui/button"
import { formatDisplayDate, formatPercentage } from "@/lib/formatters"

interface InvestmentDetailScreenProps {
  investment: Investment
  onDelete: () => void
  onEdit: () => void
  onRecordChange: () => void
}

export function InvestmentDetailScreen({
  investment,
  onDelete,
  onEdit,
  onRecordChange,
}: InvestmentDetailScreenProps) {
  const { t } = useTranslation()
  const { activeLocale } = useLocale()
  const asOfDate = new Date()
  const resolvedInvestment = resolveInvestment(investment, asOfDate)
  const upcomingReturnMetrics = getUpcomingReturnMetrics(investment, asOfDate)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const paymentFrequencyLabels = getPaymentFrequencyLabels(t)
  const reinvestmentBehaviorLabels = getReinvestmentBehaviorLabels(t)
  const investmentTypeLabels = getInvestmentTypeLabels(t)
  const upcomingMetricLabels = {
    nextDay: t("investment.detail.nextDay"),
    nextWeek: t("investment.detail.nextWeek"),
    nextYear: t("investment.detail.nextYear"),
  }
  const returnsDescription =
    resolvedInvestment.type === INVESTMENT_TYPES.fixedTerm
      ? t("investment.detail.returnsDescriptionFixedTerm")
      : t("investment.detail.returnsDescriptionOpenEnded")

  return (
    <section className="space-y-7">
      <ScreenIntro
        eyebrow={investment.institutionName}
        title={investment.name}
      />

      <InvestmentDetailActions
        onEdit={onEdit}
        onRecordChange={onRecordChange}
      />

      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 border-b border-border/30 pb-5">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              {t("investment.detail.estimatedValue")}
            </p>
            <p className="mt-2 font-ledger text-4xl leading-none tracking-normal text-foreground">
              <MoneyAmount value={resolvedInvestment.estimatedCurrentValue} />
            </p>
          </div>
          <div className="grid size-10 place-items-center rounded-lg bg-secondary/50 text-primary">
            <WalletCards className="size-5" aria-hidden="true" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b border-border/30 pb-5">
          <DetailMetric
            icon={Percent}
            label={t("investment.detail.annualRate")}
            value={formatPercentage(
              resolvedInvestment.annualRate,
              activeLocale,
            )}
          />
          <DetailMetric
            icon={Landmark}
            label={t("investment.detail.startedOn")}
            value={formatDisplayDate(
              resolvedInvestment.startDate,
              activeLocale,
            )}
          />
        </div>
      </div>

      <div className="space-y-4 border-b border-border/30 pb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t("investment.detail.returns")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {returnsDescription}
            </p>
          </div>
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary/50 text-primary">
            <TrendingUp className="size-5" aria-hidden="true" />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/10 pt-3">
          <span className="text-sm text-muted-foreground">
            {t("investment.detail.earnedSoFar")}
          </span>
          <span className="font-ledger text-xl font-medium text-foreground">
            <MoneyAmount value={resolvedInvestment.estimatedAccruedReturn} />
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2">
          {upcomingReturnMetrics.map((metric) => (
            <div
              key={metric.key}
              className="min-w-0 rounded bg-secondary/30 p-2.5"
            >
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {upcomingMetricLabels[metric.key]}
              </p>
              <p className="mt-1 font-ledger text-sm text-foreground">
                <MoneyAmount value={metric.value} />
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3.5 pb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground pb-1">
          {t("investment.detail.details")}
        </h2>
        <div className="space-y-3">
          <DetailRow
            label={t("investment.detail.type")}
            value={investmentTypeLabels[resolvedInvestment.type]}
          />
          <DetailRow
            label={t("investment.detail.paymentFrequency")}
            value={paymentFrequencyLabels[resolvedInvestment.paymentFrequency]}
          />
          <DetailRow
            label={t("investment.detail.reinvestment")}
            value={
              reinvestmentBehaviorLabels[
                resolvedInvestment.reinvestmentBehavior
              ]
            }
          />
          <DetailRow
            label={t("investment.detail.startDate")}
            value={formatDisplayDate(
              resolvedInvestment.startDate,
              activeLocale,
            )}
          />
          {resolvedInvestment.type === INVESTMENT_TYPES.fixedTerm ? (
            <>
              <DetailRow
                label={t("investment.detail.endDate")}
                value={formatDisplayDate(
                  resolvedInvestment.endDate,
                  activeLocale,
                )}
              />
              <DetailRow
                label={t("investment.detail.progress")}
                value={formatPercentage(
                  resolvedInvestment.progressPercentage,
                  activeLocale,
                  { maximumFractionDigits: 0 },
                )}
              />
            </>
          ) : null}
          <DetailRow
            label={t("investment.detail.originalAmount")}
            value={<MoneyAmount value={resolvedInvestment.originalAmount} />}
          />
        </div>
      </div>

      <div className="pt-8 mt-12 border-t border-border/20 flex justify-center pb-8">
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors px-4 py-2"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          {t("investment.detail.actions.delete")}
        </Button>
      </div>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        title={t("investment.detail.deleteTitle")}
        description={t("investment.detail.deleteDescription", {
          name: investment.name,
        })}
        confirmLabel={t("investment.detail.actions.delete")}
        variant="destructive"
        onRequestOpenChange={setIsDeleteDialogOpen}
        onConfirm={onDelete}
      />
    </section>
  )
}

function InvestmentDetailActions({
  onEdit,
  onRecordChange,
}: {
  onEdit: () => void
  onRecordChange: () => void
}) {
  const { t } = useTranslation()

  return (
    <div
      className="-mt-2 flex gap-2"
      role="group"
      aria-label={t("investment.detail.actionsAriaLabel")}
    >
      <Button
        type="button"
        variant="default"
        size="lg"
        className="min-w-0 flex-1 bg-primary text-primary-foreground hover:bg-primary/95"
        onClick={onRecordChange}
      >
        <PlusCircle className="size-4" aria-hidden="true" />
        {t("investment.detail.actions.recordUpdate")}
      </Button>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="min-w-0 flex-1 border-border/60 hover:bg-secondary/40 text-foreground"
        onClick={onEdit}
      >
        <Pencil className="size-4" aria-hidden="true" />
        {t("investment.detail.actions.updateTerms")}
      </Button>
    </div>
  )
}

function getUpcomingReturnMetrics(investment: Investment, asOfDate: Date) {
  return [
    {
      key: "nextDay" as const,
      value: getUpcomingInvestmentProjectedEarningsForDays(
        investment,
        DAY_COUNTS.day,
        asOfDate,
      ),
    },
    {
      key: "nextWeek" as const,
      value: getUpcomingInvestmentProjectedEarningsForDays(
        investment,
        DAY_COUNTS.week,
        asOfDate,
      ),
    },
    {
      key: "nextYear" as const,
      value: getUpcomingInvestmentProjectedEarningsForDays(
        investment,
        DAY_COUNTS.year,
        asOfDate,
      ),
    },
  ]
}

function DetailMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: ReactNode
}) {
  return (
    <div className="rounded-lg bg-background/60 px-3 py-3">
      <Icon className="mb-3 size-4 text-primary" aria-hidden="true" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-ledger text-base text-foreground">{value}</p>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right font-ledger text-sm text-foreground">
        {value}
      </span>
    </div>
  )
}
