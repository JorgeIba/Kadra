import { buildInvestmentFromFormValues } from "@/app/screens/invest/adapters/investment-form-adapter"
import { InvestmentForm } from "@/app/screens/invest/InvestmentForm"
import type { InvestmentFormValues } from "@/app/screens/invest/investment-form-schema"
import type { Investment } from "@/domain/investments"

interface InvestScreenProps {
  onCancel: () => void
  onInvestmentCreate: (investment: Investment) => void
}

export function InvestScreen({
  onCancel,
  onInvestmentCreate,
}: InvestScreenProps) {
  function handleInvestmentSubmit(values: InvestmentFormValues) {
    const investment = buildInvestmentFromFormValues(values, {
      asOfDate: new Date(),
      id: crypto.randomUUID(),
    })

    onInvestmentCreate(investment)
  }

  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <p className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Invest
        </p>
        <h1 className="font-ledger text-3xl font-normal tracking-normal">
          New investment
        </h1>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          Capture the terms once so Trafin can track value, estimated income,
          and maturity progress from the moment you save it.
        </p>
      </div>

      <InvestmentForm onCancel={onCancel} onSubmit={handleInvestmentSubmit} />
    </section>
  )
}
