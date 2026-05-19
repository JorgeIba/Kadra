import { INVESTMENT_TYPES, type InvestmentSummary } from "@/domain/investments"
import { FixedTermInvestmentCard } from "@/app/components/investments/FixedTermInvestmentCard"
import { OpenEndedInvestmentCard } from "@/app/components/investments/OpenEndedInvestmentCard"

interface InvestmentCardProps {
  investment: InvestmentSummary
  onSelect?: (investmentId: string) => void
}

export function InvestmentCard({ investment, onSelect }: InvestmentCardProps) {
  if (investment.type === INVESTMENT_TYPES.fixedTerm) {
    return (
      <FixedTermInvestmentCard investment={investment} onSelect={onSelect} />
    )
  }

  return <OpenEndedInvestmentCard investment={investment} onSelect={onSelect} />
}
