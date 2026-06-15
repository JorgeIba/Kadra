import { useState } from "react"
import {
  ArrowLeft,
  Landmark,
  Pencil,
  Percent,
  Trash2,
  WalletCards,
} from "lucide-react"
import { ConfirmDialog } from "@/app/components/ConfirmDialog"
import { ScreenIntro } from "@/app/components/ScreenIntro"
import {
  INVESTMENT_TYPE_LABELS,
  PAYMENT_FREQUENCY_LABELS,
  REINVESTMENT_BEHAVIOR_LABELS,
  getInvestmentDerivedValues,
  type Investment,
} from "@/domain/investments"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatMxn, formatPercentage } from "@/lib/formatters"

interface InvestmentDetailScreenProps {
  investment: Investment
  onBack: () => void
  onDelete: () => void
  onEdit: () => void
}

export function InvestmentDetailScreen({
  investment,
  onBack,
  onDelete,
  onEdit,
}: InvestmentDetailScreenProps) {
  const derivedValues = getInvestmentDerivedValues(investment, new Date())
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  return (
    <section className="space-y-7">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back
      </Button>

      <div className="flex items-start justify-between gap-4">
        <ScreenIntro
          eyebrow={investment.institutionName}
          title={investment.name}
          action={
            <Button type="button" variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="size-4" aria-hidden="true" />
              Edit
            </Button>
          }
        />
      </div>

      <Card className="rounded-lg bg-secondary/70">
        <CardContent className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Estimated value</p>
              <p className="mt-2 font-ledger text-4xl leading-none tracking-normal text-foreground">
                {formatMxn(derivedValues.estimatedCurrentValue)}
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
              value={formatPercentage(derivedValues.annualRate)}
            />
            <DetailMetric
              icon={Landmark}
              label="Original amount"
              value={formatMxn(derivedValues.originalAmount)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardContent className="space-y-4">
          <DetailRow
            label="Type"
            value={INVESTMENT_TYPE_LABELS[derivedValues.type]}
          />
          <DetailRow
            label="Payment frequency"
            value={PAYMENT_FREQUENCY_LABELS[derivedValues.paymentFrequency]}
          />
          <DetailRow
            label="Reinvestment"
            value={
              REINVESTMENT_BEHAVIOR_LABELS[derivedValues.reinvestmentBehavior]
            }
          />
          <DetailRow label="Start date" value={derivedValues.startDate} />
          {derivedValues.type === "fixed-term" ? (
            <>
              <DetailRow label="End date" value={derivedValues.endDate} />
              <DetailRow
                label="Progress"
                value={`${Math.round(derivedValues.progressPercentage)}%`}
              />
            </>
          ) : null}
          <DetailRow
            label="Accrued return"
            value={formatMxn(derivedValues.estimatedAccruedReturn)}
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
              Remove this investment from your local list. This action cannot be
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
        description={`This removes "${investment.name}" from your local investment list. This action cannot be undone.`}
        confirmLabel="Delete investment"
        variant="destructive"
        onRequestOpenChange={setIsDeleteDialogOpen}
        onConfirm={onDelete}
      />
    </section>
  )
}

function DetailMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Percent
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
