import { ScreenIntro } from "@/app/components/ScreenIntro"
import { useTranslation } from "react-i18next"
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
  const { t } = useTranslation()

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
        eyebrow={investment.institutionName}
        title={investment.name}
        description={t("invest.edit.description")}
      />

      <InvestmentForm
        cancelLabel={t("invest.edit.backToDetail")}
        institutionSuggestions={institutionSuggestions}
        initialValues={mapInvestmentToFormValues(investment)}
        isStartDateEditable={canEditInvestmentStartDate(investment)}
        onCancel={onCancel}
        submitLabel={t("invest.edit.saveChanges")}
        successMessage={t("invest.edit.changesSaved")}
        onSubmit={handleInvestmentSubmit}
      />
    </section>
  )
}
