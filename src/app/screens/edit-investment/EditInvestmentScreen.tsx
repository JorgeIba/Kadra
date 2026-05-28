import {
  mapInvestmentToFormValues,
  buildUpdatedInvestmentFromFormValues,
} from "@/app/screens/invest/adapters/investment-form-adapter"
import { InvestmentForm } from "@/app/screens/invest/InvestmentForm"
import type { InvestmentFormValues } from "@/app/screens/invest/investment-form-schema"
import type { Investment } from "@/domain/investments"

interface EditInvestmentScreenProps {
  investment: Investment
  onInvestmentUpdate: (investment: Investment) => void
}

export function EditInvestmentScreen({
  investment,
  onInvestmentUpdate,
}: EditInvestmentScreenProps) {
  function handleInvestmentSubmit(values: InvestmentFormValues) {
    const updatedInvestment = buildUpdatedInvestmentFromFormValues(
      values,
      investment,
      {
        asOfDate: new Date(),
      },
    )

    onInvestmentUpdate(updatedInvestment)
  }

  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">
          Edit investment
        </p>
        <h1 className="text-3xl font-semibold tracking-normal">Update terms</h1>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          Adjust the stored terms for this local investment.
        </p>
      </div>

      <InvestmentForm
        initialValues={mapInvestmentToFormValues(investment)}
        submitLabel="Save changes"
        successMessage="Changes saved."
        onSubmit={handleInvestmentSubmit}
      />
    </section>
  )
}
