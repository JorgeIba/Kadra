import { ScreenIntro } from "@/app/components/ScreenIntro"
import {
  buildUpdatedInvestmentFromFormValues,
  canEditInvestmentStartDate,
  mapInvestmentToFormValues,
} from "@/app/screens/invest/adapters/investment-form-adapter"
import { InvestmentForm } from "@/app/screens/invest/InvestmentForm"
import type { InvestmentFormValues } from "@/app/screens/invest/investment-form-schema"
import type { Investment } from "@/domain/investments"

interface EditInvestmentScreenProps {
  institutionSuggestions?: string[]
  investment: Investment
  onCancel: () => void
  onInvestmentUpdate: (investment: Investment) => void
}

export function EditInvestmentScreen({
  institutionSuggestions = [],
  investment,
  onCancel,
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
      <ScreenIntro
        eyebrow="Edit investment"
        title="Update terms"
        description="Adjust the stored terms so Trafin keeps current value, income, and maturity tracking aligned with the latest details."
      />

      <InvestmentForm
        cancelLabel="Back to detail"
        institutionSuggestions={institutionSuggestions}
        initialValues={mapInvestmentToFormValues(investment)}
        isStartDateEditable={canEditInvestmentStartDate(investment)}
        onCancel={onCancel}
        submitLabel="Save changes"
        successMessage="Changes saved."
        onSubmit={handleInvestmentSubmit}
      />
    </section>
  )
}
