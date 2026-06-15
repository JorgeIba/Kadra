import {
  DERIVED_STATUS_LABELS,
  DERIVED_STATUSES,
  INVESTMENT_TYPE_LABELS,
  INVESTMENT_TYPES,
  getInvestmentDerivedValues,
  getPortfolioEstimatedCurrentValue,
  type Investment,
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
  investments: Investment[],
  asOfDate: Date,
): PortfolioBreakdown {
  const totalEstimatedValue = getPortfolioEstimatedCurrentValue(
    investments,
    asOfDate,
  )

  return {
    byType: [
      getBreakdownItem({
        investments,
        label: INVESTMENT_TYPE_LABELS[INVESTMENT_TYPES.fixedTerm],
        matches: (investment) =>
          getInvestmentDerivedValues(investment, asOfDate).type ===
          INVESTMENT_TYPES.fixedTerm,
        totalEstimatedValue,
        asOfDate,
      }),
      getBreakdownItem({
        investments,
        label: INVESTMENT_TYPE_LABELS[INVESTMENT_TYPES.openEnded],
        matches: (investment) =>
          getInvestmentDerivedValues(investment, asOfDate).type ===
          INVESTMENT_TYPES.openEnded,
        totalEstimatedValue,
        asOfDate,
      }),
    ],
    byStatus: [
      getBreakdownItem({
        investments,
        label: DERIVED_STATUS_LABELS[DERIVED_STATUSES.active],
        matches: (investment) =>
          getInvestmentDerivedValues(investment, asOfDate).derivedStatus ===
          DERIVED_STATUSES.active,
        totalEstimatedValue,
        asOfDate,
      }),
      getBreakdownItem({
        investments,
        label: DERIVED_STATUS_LABELS[DERIVED_STATUSES.finished],
        matches: (investment) =>
          getInvestmentDerivedValues(investment, asOfDate).derivedStatus ===
          DERIVED_STATUSES.finished,
        totalEstimatedValue,
        asOfDate,
      }),
    ],
  }
}

function getBreakdownItem({
  asOfDate,
  investments,
  label,
  matches,
  totalEstimatedValue,
}: {
  asOfDate: Date
  investments: Investment[]
  label: string
  matches: (investment: Investment) => boolean
  totalEstimatedValue: number
}): PortfolioBreakdownItem {
  const matchingInvestments = investments.filter(matches)
  const estimatedValue = getPortfolioEstimatedCurrentValue(
    matchingInvestments,
    asOfDate,
  )

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
