import { createInvestmentFromFormValues } from "@/app/screens/invest/adapters/investment-form-adapter"
import { InvestmentForm } from "@/app/screens/invest/InvestmentForm"
import type { InvestmentFormValues } from "@/app/screens/invest/investment-form-schema"
import type { Investment } from "@/domain/investments"

interface InvestScreenProps {
  onInvestmentCreate: (investment: Investment) => void
}

export function InvestScreen({ onInvestmentCreate }: InvestScreenProps) {
  function handleInvestmentSubmit(values: InvestmentFormValues) {
    const investment = createInvestmentFromFormValues(values, {
      asOfDate: new Date(),
      id: crypto.randomUUID(),
    })

    onInvestmentCreate(investment)
  }

  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Invest</p>
        <h1 className="text-3xl font-semibold tracking-normal">
          New investment
        </h1>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          Capture the investment terms first. For this pass, valid submissions
          become a local draft before database persistence exists.
        </p>
      </div>

      <InvestmentForm onSubmit={handleInvestmentSubmit} />
    </section>
  )
}
