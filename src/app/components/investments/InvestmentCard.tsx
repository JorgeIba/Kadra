import { INVESTMENT_TYPES, type InvestmentSummary } from "@/domain/investments"
import { FixedTermInvestmentCard } from "@/app/components/investments/FixedTermInvestmentCard"
import { OpenEndedInvestmentCard } from "@/app/components/investments/OpenEndedInvestmentCard"

interface InvestmentCardProps {
  investment: InvestmentSummary
}

export function InvestmentCard({ investment }: InvestmentCardProps) {
  if (investment.type === INVESTMENT_TYPES.fixedTerm) {
    return <FixedTermInvestmentCard investment={investment} />
  }

  return <OpenEndedInvestmentCard investment={investment} />
}
