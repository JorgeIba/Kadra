import { useState } from "react"
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
import { Card, CardContent } from "@/components/ui/card"
import {
  formatDisplayDate,
  formatMxn,
  formatPercentage,
} from "@/lib/formatters"

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

      <Card className="rounded-lg bg-secondary/70">
        <CardContent className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Estimated value</p>
              <p className="mt-2 font-ledger text-4xl leading-none tracking-normal text-foreground">
                {formatMxn(resolvedInvestment.estimatedCurrentValue)}
              </p>
            </div>
            <div className="grid size-10 place-items-center rounded-lg bg-background/60 text-primary">
              <WalletCards className="size-5" aria-hidden="true" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardContent className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-base font-bold leading-tight text-foreground">
                Returns
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {getReturnsDescription(resolvedInvestment.type)}
              </p>
            </div>
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary/70 text-primary">
              <TrendingUp className="size-5" aria-hidden="true" />
            </div>
          </div>

          <div className="rounded-lg bg-secondary/60 px-3 py-3">
            <p className="text-xs text-muted-foreground">Earned so far</p>
            <p className="mt-2 font-ledger text-2xl leading-none text-foreground tabular-nums">
              {formatMxn(resolvedInvestment.estimatedAccruedReturn)}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-3">
            {upcomingReturnMetrics.map((metric) => (
              <div
                key={metric.label}
                className="min-w-0 rounded-lg bg-secondary/45 p-3"
              >
                <p className="text-xs leading-5 text-muted-foreground">
                  {metric.label}
                </p>
                <p className="mt-2 font-ledger text-sm leading-none text-foreground tabular-nums">
                  {formatMxn(metric.value)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardContent className="space-y-4">
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
            value={formatMxn(resolvedInvestment.originalAmount)}
          />
        </CardContent>
      </Card>

      <Card className="rounded-lg border-destructive/20 bg-destructive/10">
        <CardContent className="space-y-3">
          <div>
            <h2 className="text-base font-semibold text-destructive">
              Delete investment
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Remove this investment from your portfolio. This action cannot be
              undone.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Delete investment
          </Button>
        </CardContent>
      </Card>

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
        variant="secondary"
        size="lg"
        className="min-w-0 flex-1"
        onClick={onRecordChange}
      >
        <PlusCircle className="size-4" aria-hidden="true" />
        Record update
      </Button>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="min-w-0 flex-1"
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
  value: string
}) {
  return (
    <div className="rounded-lg bg-background/60 px-3 py-3">
      <Icon className="mb-3 size-4 text-primary" aria-hidden="true" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-ledger text-base text-foreground">{value}</p>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right font-ledger text-sm text-foreground">
        {value}
      </span>
    </div>
  )
}
