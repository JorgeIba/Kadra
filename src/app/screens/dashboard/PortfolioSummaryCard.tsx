import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "react-i18next"
import { MoneyAmount } from "@/app/components/MoneyAmount"

interface PortfolioSummaryCardProps {
  activeInvestments: number
  earnedSoFar: number
  totalValue: number
}

export function PortfolioSummaryCard({
  activeInvestments,
  earnedSoFar,
  totalValue,
}: PortfolioSummaryCardProps) {
  const { t } = useTranslation()

  return (
    <Card className="rounded-lg bg-secondary/70">
      <CardHeader>
        <CardTitle className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {t("dashboard.summary.activePortfolioValue")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-7">
        <h1 className="font-ledger text-[2.7rem] font-normal leading-none tracking-normal text-foreground">
          <MoneyAmount value={totalValue} />
        </h1>

        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2">
            <p className="text-xs leading-none text-muted-foreground">
              {t("dashboard.summary.activeInvestments")}
            </p>
            <p className="font-ledger text-xl leading-none text-success tabular-nums">
              {activeInvestments}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs leading-none text-muted-foreground">
              {t("dashboard.summary.earnedSoFar")}
            </p>
            <p className="font-ledger text-xl leading-none text-foreground">
              <MoneyAmount value={earnedSoFar} />
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
