import {
  DERIVED_STATUSES,
  INVESTMENT_TYPES,
  getPortfolioEstimatedCurrentValue,
  type InvestmentType,
  type ResolvedInvestment,
} from "@/domain/investments"

export interface PortfolioBreakdownItem {
  type: InvestmentType
  count: number
  estimatedValue: number
  percentage: number
}

export interface PortfolioBreakdown {
  activeCapitalByType: PortfolioBreakdownItem[]
}

export function getPortfolioBreakdown(
  investments: ResolvedInvestment[],
): PortfolioBreakdown {
  const activeInvestments = investments.filter((investment) => {
    return investment.derivedStatus === DERIVED_STATUSES.active
  })
  const totalEstimatedValue =
    getPortfolioEstimatedCurrentValue(activeInvestments)

  return {
    activeCapitalByType: [
      getBreakdownItem({
        investments: activeInvestments,
        type: INVESTMENT_TYPES.fixedTerm,
        matches: (investment) => investment.type === INVESTMENT_TYPES.fixedTerm,
        totalEstimatedValue,
      }),
      getBreakdownItem({
        investments: activeInvestments,
        type: INVESTMENT_TYPES.openEnded,
        matches: (investment) => investment.type === INVESTMENT_TYPES.openEnded,
        totalEstimatedValue,
      }),
    ].filter((item) => item.count > 0),
  }
}

function getBreakdownItem({
  investments,
  type,
  matches,
  totalEstimatedValue,
}: {
  investments: ResolvedInvestment[]
  type: InvestmentType
  matches: (investment: ResolvedInvestment) => boolean
  totalEstimatedValue: number
}): PortfolioBreakdownItem {
  const matchingInvestments = investments.filter(matches)
  const estimatedValue = getPortfolioEstimatedCurrentValue(matchingInvestments)

  return {
    type,
    count: matchingInvestments.length,
    estimatedValue,
    percentage:
      totalEstimatedValue === 0
        ? 0
        : (estimatedValue / totalEstimatedValue) * 100,
  }
}
