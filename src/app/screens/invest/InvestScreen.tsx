import { buildInvestmentFromFormValues } from "@/app/screens/invest/adapters/investment-form-adapter"
import { useTranslation } from "react-i18next"
import { InvestmentForm } from "@/app/screens/invest/InvestmentForm"
import { ScreenIntro } from "@/app/components/ScreenIntro"
import type { InvestmentFormValues } from "@/app/screens/invest/investment-form-schema"
import type { Investment } from "@/domain/investments"

interface InvestScreenProps {
  institutionSuggestions?: string[]
  onCancel: () => void
  onInvestmentCreate: (investment: Investment) => void
}

export function InvestScreen({
  institutionSuggestions = [],
  onCancel,
  onInvestmentCreate,
}: InvestScreenProps) {
  const { t } = useTranslation()

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
        eyebrow={t("invest.screen.eyebrow")}
        title={t("invest.screen.title")}
        description={t("invest.screen.description")}
      />

      <InvestmentForm
        institutionSuggestions={institutionSuggestions}
        onCancel={onCancel}
        onSubmit={handleInvestmentSubmit}
      />
    </section>
  )
}
