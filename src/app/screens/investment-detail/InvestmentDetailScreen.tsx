import { ArrowLeft, Landmark, Percent, Trash2, WalletCards } from "lucide-react"
import {
  INVESTMENT_TYPE_LABELS,
  INVESTMENT_TYPES,
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
}

export function InvestmentDetailScreen({
  investment,
  onBack,
  onDelete,
}: InvestmentDetailScreenProps) {
  const derivedValues = getInvestmentDerivedValues(investment, new Date())

  function handleDelete() {
    const shouldDelete = window.confirm(
      `Delete "${investment.name}" from your investments?`,
    )

    if (!shouldDelete) {
      return
    }

    onDelete()
  }

  return (
    <section className="space-y-5">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back
      </Button>

      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">
          {investment.institutionName}
        </p>
        <h1 className="text-3xl font-semibold tracking-normal">
          {investment.name}
        </h1>
      </div>

      <Card className="border-none bg-primary text-primary-foreground shadow-xl shadow-emerald-950/10 ring-0">
        <CardContent className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-primary-foreground/70">
                Estimated value
              </p>
              <p className="mt-2 text-4xl font-semibold tracking-normal">
                {formatMxn(derivedValues.estimatedCurrentValue)}
              </p>
            </div>
            <div className="grid size-10 place-items-center rounded-lg bg-primary-foreground/10">
              <WalletCards className="size-5" aria-hidden="true" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DetailMetric
              icon={Percent}
              label="Annual rate"
              value={formatPercentage(investment.annualRate)}
            />
            <DetailMetric
              icon={Landmark}
              label="Original amount"
              value={formatMxn(investment.originalAmount)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardContent className="space-y-4">
          <DetailRow
            label="Type"
            value={INVESTMENT_TYPE_LABELS[investment.type]}
          />
          <DetailRow
            label="Payment frequency"
            value={PAYMENT_FREQUENCY_LABELS[investment.paymentFrequency]}
          />
          <DetailRow
            label="Reinvestment"
            value={
              REINVESTMENT_BEHAVIOR_LABELS[investment.reinvestmentBehavior]
            }
          />
          <DetailRow label="Start date" value={investment.startDate} />
          {investment.type === INVESTMENT_TYPES.fixedTerm &&
          derivedValues.type === INVESTMENT_TYPES.fixedTerm ? (
            <>
              <DetailRow label="End date" value={investment.endDate} />
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

      <Card className="rounded-lg border-destructive/20 bg-destructive/5">
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
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="size-4" aria-hidden="true" />
            Delete investment
          </Button>
        </CardContent>
      </Card>
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
    <div className="rounded-lg bg-primary-foreground/10 px-3 py-3">
      <Icon
        className="mb-3 size-4 text-primary-foreground/70"
        aria-hidden="true"
      />
      <p className="text-xs text-primary-foreground/60">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  )
}
