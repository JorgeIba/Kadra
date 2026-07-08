import { useState, type ReactNode } from "react"
import {
  ArrowLeft,
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
import { MoneyAmount } from "@/app/components/MoneyAmount"
import { ScreenIntro } from "@/app/components/ScreenIntro"
import {
  DAY_COUNTS,
  INVESTMENT_TYPE_LABELS,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCY_LABELS,
  REINVESTMENT_BEHAVIOR_LABELS,
  getUpcomingInvestmentProjectedEarningsForDays,
  resolveInvestment,
  type Investment,
  type InvestmentType,
} from "@/domain/investments"
import { Button } from "@/components/ui/button"
import { formatDisplayDate, formatPercentage } from "@/lib/formatters"

interface InvestmentDetailScreenProps {
  investment: Investment
  onBack: () => void
  onDelete: () => void
  onEdit: () => void
  onRecordChange: () => void
}

export function InvestmentDetailScreen({
  investment,
  onBack,
  onDelete,
  onEdit,
  onRecordChange,
}: InvestmentDetailScreenProps) {
  const asOfDate = new Date()
  const resolvedInvestment = resolveInvestment(investment, asOfDate)
  const upcomingReturnMetrics = getUpcomingReturnMetrics(investment, asOfDate)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  return (
    <section className="space-y-7">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back
      </Button>

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
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Estimated value</p>
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
            label="Annual rate"
            value={formatPercentage(resolvedInvestment.annualRate)}
          />
          <DetailMetric
            icon={Landmark}
            label="Started on"
            value={formatDisplayDate(resolvedInvestment.startDate)}
          />
        </div>
      </div>

      <div className="space-y-4 border-b border-border/30 pb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Returns
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {getReturnsDescription(resolvedInvestment.type)}
            </p>
          </div>
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary/50 text-primary">
            <TrendingUp className="size-5" aria-hidden="true" />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/10 pt-3">
          <span className="text-sm text-muted-foreground">Earned so far</span>
          <span className="font-ledger text-xl font-medium text-foreground">
            <MoneyAmount value={resolvedInvestment.estimatedAccruedReturn} />
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2">
          {upcomingReturnMetrics.map((metric) => (
            <div
              key={metric.label}
              className="min-w-0 rounded bg-secondary/30 p-2.5"
            >
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {metric.label}
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
          Investment details
        </h2>
        <div className="space-y-3">
          <DetailRow
            label="Type"
            value={INVESTMENT_TYPE_LABELS[resolvedInvestment.type]}
          />
          <DetailRow
            label="Payment frequency"
            value={
              PAYMENT_FREQUENCY_LABELS[resolvedInvestment.paymentFrequency]
            }
          />
          <DetailRow
            label="Reinvestment"
            value={
              REINVESTMENT_BEHAVIOR_LABELS[
                resolvedInvestment.reinvestmentBehavior
              ]
            }
          />
          <DetailRow
            label="Start date"
            value={formatDisplayDate(resolvedInvestment.startDate)}
          />
          {resolvedInvestment.type === INVESTMENT_TYPES.fixedTerm ? (
            <>
              <DetailRow
                label="End date"
                value={formatDisplayDate(resolvedInvestment.endDate)}
              />
              <DetailRow
                label="Progress"
                value={`${Math.round(resolvedInvestment.progressPercentage)}%`}
              />
            </>
          ) : null}
          <DetailRow
            label="Original amount"
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
          Delete investment
        </Button>
      </div>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Delete investment?"
        description={`This removes "${investment.name}" from your portfolio. This action cannot be undone.`}
        confirmLabel="Delete investment"
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
  return (
    <div
      className="-mt-2 flex gap-2"
      role="group"
      aria-label="Investment actions"
    >
      <Button
        type="button"
        variant="default"
        size="lg"
        className="min-w-0 flex-1 bg-primary text-primary-foreground hover:bg-primary/95"
        onClick={onRecordChange}
      >
        <PlusCircle className="size-4" aria-hidden="true" />
        Record update
      </Button>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="min-w-0 flex-1 border-border/60 hover:bg-secondary/40 text-foreground"
        onClick={onEdit}
      >
        <Pencil className="size-4" aria-hidden="true" />
        Update terms
      </Button>
    </div>
  )
}

function getUpcomingReturnMetrics(investment: Investment, asOfDate: Date) {
  return [
    {
      label: "Next day",
      value: getUpcomingInvestmentProjectedEarningsForDays(
        investment,
        DAY_COUNTS.day,
        asOfDate,
      ),
    },
    {
      label: "Next week",
      value: getUpcomingInvestmentProjectedEarningsForDays(
        investment,
        DAY_COUNTS.week,
        asOfDate,
      ),
    },
    {
      label: "Next year",
      value: getUpcomingInvestmentProjectedEarningsForDays(
        investment,
        DAY_COUNTS.year,
        asOfDate,
      ),
    },
  ]
}

function getReturnsDescription(investmentType: InvestmentType) {
  if (investmentType === INVESTMENT_TYPES.fixedTerm) {
    return "Estimates start today and stop at maturity."
  }

  return "Estimates start today and continue while the investment stays active."
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
