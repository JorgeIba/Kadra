import {
  DERIVED_STATUS_LABELS,
  DERIVED_STATUSES,
  INVESTMENT_TYPE_LABELS,
  INVESTMENT_TYPES,
  getPortfolioEstimatedCurrentValue,
  type ResolvedInvestment,
} from "@/domain/investments"

export interface PortfolioBreakdownItem {
  label: string
  count: number
  estimatedValue: number
  percentage: number
}

export interface PortfolioBreakdown {
  byType: PortfolioBreakdownItem[]
  byStatus: PortfolioBreakdownItem[]
}

export function getPortfolioBreakdown(
  investments: ResolvedInvestment[],
): PortfolioBreakdown {
  const totalEstimatedValue = getPortfolioEstimatedCurrentValue(investments)

  return {
    byType: [
      getBreakdownItem({
        investments,
        label: INVESTMENT_TYPE_LABELS[INVESTMENT_TYPES.fixedTerm],
        matches: (investment) => investment.type === INVESTMENT_TYPES.fixedTerm,
        totalEstimatedValue,
      }),
      getBreakdownItem({
        investments,
        label: INVESTMENT_TYPE_LABELS[INVESTMENT_TYPES.openEnded],
        matches: (investment) => investment.type === INVESTMENT_TYPES.openEnded,
        totalEstimatedValue,
      }),
    ],
    byStatus: [
      getBreakdownItem({
        investments,
        label: DERIVED_STATUS_LABELS[DERIVED_STATUSES.active],
        matches: (investment) =>
          investment.derivedStatus === DERIVED_STATUSES.active,
        totalEstimatedValue,
      }),
      getBreakdownItem({
        investments,
        label: DERIVED_STATUS_LABELS[DERIVED_STATUSES.finished],
        matches: (investment) =>
          investment.derivedStatus === DERIVED_STATUSES.finished,
        totalEstimatedValue,
      }),
    ],
  }
}

function getBreakdownItem({
  investments,
  label,
  matches,
  totalEstimatedValue,
}: {
  investments: ResolvedInvestment[]
  label: string
  matches: (investment: ResolvedInvestment) => boolean
  totalEstimatedValue: number
}): PortfolioBreakdownItem {
  const matchingInvestments = investments.filter(matches)
  const estimatedValue = getPortfolioEstimatedCurrentValue(matchingInvestments)

  return {
    label,
    count: matchingInvestments.length,
    estimatedValue,
    percentage:
      totalEstimatedValue === 0
        ? 0
        : (estimatedValue / totalEstimatedValue) * 100,
  }
}
