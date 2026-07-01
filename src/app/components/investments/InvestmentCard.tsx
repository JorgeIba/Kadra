import { INVESTMENT_TYPES, type InvestmentSummary } from "@/domain/investments"
import { FixedTermInvestmentCard } from "@/app/components/investments/FixedTermInvestmentCard"
import { OpenEndedInvestmentCard } from "@/app/components/investments/OpenEndedInvestmentCard"

interface InvestmentCardProps {
  investment: InvestmentSummary
  density?: "default" | "relaxed"
  onSelect?: (investmentId: string) => void
}

export function InvestmentCard({
  density = "default",
  investment,
  onSelect,
}: InvestmentCardProps) {
  if (investment.type === INVESTMENT_TYPES.fixedTerm) {
    return (
      <FixedTermInvestmentCard
        density={density}
        investment={investment}
        onSelect={onSelect}
      />
    )
  }

  return (
    <OpenEndedInvestmentCard
      density={density}
      investment={investment}
      onSelect={onSelect}
    />
  )
}
