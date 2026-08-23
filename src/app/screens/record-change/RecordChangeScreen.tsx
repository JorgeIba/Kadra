import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import { ScreenIntro } from "@/app/components/ScreenIntro"
import { buildInvestmentWithRecordedChangeFromFormValues } from "@/app/screens/record-change/adapters/record-change-adapter"
import { RecordChangeForm } from "@/app/screens/record-change/RecordChangeForm"
import type { RecordChangeFormValues } from "@/app/screens/record-change/record-change-form-schema"
import type { Investment } from "@/domain/investments"

interface RecordChangeScreenProps {
  investment: Investment
  onCancel: () => void
  onInvestmentUpdate: (investment: Investment) => void
}

export function RecordChangeScreen({
  investment,
  onCancel,
  onInvestmentUpdate,
}: RecordChangeScreenProps) {
  const { t } = useTranslation()
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  const handleFormChange = useCallback(() => {
    setErrorMessage(undefined)
  }, [])

  function handleRecordChangeSubmit(values: RecordChangeFormValues) {
    try {
      const updatedInvestment = buildInvestmentWithRecordedChangeFromFormValues(
        values,
        investment,
        {
          asOfDate: new Date(),
          t,
        },
      )

      setErrorMessage(undefined)
      onInvestmentUpdate(updatedInvestment)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t("recordChange.form.guidance.changeSomething"),
      )
    }
  }

  return (
    <section className="space-y-5">
      <ScreenIntro
        eyebrow={investment.institutionName}
        title={investment.name}
        description={t("recordChange.screen.description")}
      />

      <RecordChangeForm
        investment={investment}
        errorMessage={errorMessage}
        onCancel={onCancel}
        onChange={handleFormChange}
        onSubmit={handleRecordChangeSubmit}
      />
    </section>
  )
}
