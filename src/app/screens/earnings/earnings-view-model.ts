import {
  DERIVED_STATUSES,
  analyzePortfolio,
  resolveInvestment,
  type DerivedStatus,
  type Investment,
  type InvestmentType,
} from "@/domain/investments"

export const EARNED_MONEY_SORT_OPTIONS = {
  highestEarned: "highest-earned",
  lowestEarned: "lowest-earned",
  name: "name",
  status: "status",
} as const

export type EarnedMoneySortOption =
  (typeof EARNED_MONEY_SORT_OPTIONS)[keyof typeof EARNED_MONEY_SORT_OPTIONS]

export interface InvestmentEarnedMoneyBreakdownItem {
  investmentId: string
  name: string
  institutionName: string
  type: InvestmentType
  derivedStatus: DerivedStatus
  earnedAmount: number
  percentage: number
}

export type InvestmentEarnedMoneyBreakdown =
  InvestmentEarnedMoneyBreakdownItem[]

export interface PortfolioEarnedMoneySnapshot {
  totalEarnedAmount: number
  activeInvestmentCount: number
  finishedInvestmentCount: number
  investmentCount: number
  breakdown: InvestmentEarnedMoneyBreakdown
}

export function getPortfolioEarnedMoneySnapshot(
  investments: Investment[],
  asOfDate = new Date(),
  sortBy: EarnedMoneySortOption = EARNED_MONEY_SORT_OPTIONS.highestEarned,
): PortfolioEarnedMoneySnapshot {
  const resolvedInvestments = investments.map((investment) => {
    return resolveInvestment(investment, asOfDate)
  })
  const portfolioAnalysis = analyzePortfolio(resolvedInvestments)
  const totalEarnedAmount = portfolioAnalysis.totalEstimatedAccruedReturn
  const breakdown = resolvedInvestments
    .map((investment) => {
      return {
        investmentId: investment.id,
        name: investment.name,
        institutionName: investment.institutionName,
        type: investment.type,
        derivedStatus: investment.derivedStatus,
        earnedAmount: investment.estimatedAccruedReturn,
        percentage:
          totalEarnedAmount === 0
            ? 0
            : (investment.estimatedAccruedReturn / totalEarnedAmount) * 100,
      }
    })
    .sort(createEarnedMoneyComparator(sortBy))

  return {
    totalEarnedAmount,
    activeInvestmentCount: portfolioAnalysis.activeInvestmentCount,
    finishedInvestmentCount: portfolioAnalysis.finishedInvestmentCount,
    investmentCount: portfolioAnalysis.investmentCount,
    breakdown,
  }
}

function createEarnedMoneyComparator(sortBy: EarnedMoneySortOption) {
  switch (sortBy) {
    case EARNED_MONEY_SORT_OPTIONS.lowestEarned:
      return (
        left: InvestmentEarnedMoneyBreakdownItem,
        right: InvestmentEarnedMoneyBreakdownItem,
      ) => {
        return (
          left.earnedAmount - right.earnedAmount ||
          left.name.localeCompare(right.name)
        )
      }
    case EARNED_MONEY_SORT_OPTIONS.name:
      return (
        left: InvestmentEarnedMoneyBreakdownItem,
        right: InvestmentEarnedMoneyBreakdownItem,
      ) => {
        return (
          left.name.localeCompare(right.name) ||
          right.earnedAmount - left.earnedAmount
        )
      }
    case EARNED_MONEY_SORT_OPTIONS.status:
      return (
        left: InvestmentEarnedMoneyBreakdownItem,
        right: InvestmentEarnedMoneyBreakdownItem,
      ) => {
        return (
          getStatusSortOrder(left.derivedStatus) -
            getStatusSortOrder(right.derivedStatus) ||
          right.earnedAmount - left.earnedAmount ||
          left.name.localeCompare(right.name)
        )
      }
    case EARNED_MONEY_SORT_OPTIONS.highestEarned:
    default:
      return (
        left: InvestmentEarnedMoneyBreakdownItem,
        right: InvestmentEarnedMoneyBreakdownItem,
      ) => {
        return (
          right.earnedAmount - left.earnedAmount ||
          left.name.localeCompare(right.name)
        )
      }
  }
}

function getStatusSortOrder(status: DerivedStatus) {
  switch (status) {
    case DERIVED_STATUSES.active:
      return 0
    case DERIVED_STATUSES.finished:
      return 1
  }
}
