import { ScreenIntro } from "@/app/components/ScreenIntro"
import { useTranslation } from "react-i18next"

export function InvestmentNotFound() {
  const { t } = useTranslation()

  return (
    <section className="space-y-3">
      <ScreenIntro
        eyebrow={t("investment.notFound.eyebrow")}
        title={t("investment.notFound.title")}
        description={t("investment.notFound.description")}
      />
    </section>
  )
}
