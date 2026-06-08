import { buildInvestmentFromFormValues } from "@/app/screens/invest/adapters/investment-form-adapter"
import { InvestmentForm } from "@/app/screens/invest/InvestmentForm"
import { ScreenIntro } from "@/app/components/ScreenIntro"
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
      <ScreenIntro
        eyebrow="Invest"
        title="New investment"
        description="Capture the terms once so Trafin can track value, estimated income, and maturity progress from the moment you save it."
      />

      <InvestmentForm onCancel={onCancel} onSubmit={handleInvestmentSubmit} />
    </section>
  )
}
