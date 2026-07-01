import { getEstimatedInterestForDays } from "@/domain/investments/calculations/interest"
import {
  getEstimatedMonthlyInterest,
  getEstimatedYearlyInterest,
} from "@/domain/investments/calculations/interest"
import { DERIVED_STATUSES } from "@/domain/investments/model/constants"
import type { ResolvedInvestment } from "@/domain/investments/model/types"

export interface PortfolioAnalysis {
  investments: ResolvedInvestment[]
  investmentCount: number
  totalEstimatedCurrentValue: number
  totalEstimatedAccruedReturn: number
  activeInvestmentCount: number
  finishedInvestmentCount: number
  totalEstimatedDailyReturn: number
  totalEstimatedMonthlyReturn: number
  totalEstimatedYearlyReturn: number
}

export function analyzePortfolio(
  investments: ResolvedInvestment[],
): PortfolioAnalysis {
  const activeInvestments = investments.filter((investment) => {
    return investment.derivedStatus === DERIVED_STATUSES.active
  })

  return {
    investments,
    investmentCount: investments.length,
    totalEstimatedCurrentValue: activeInvestments.reduce(
      (total, investment) => {
        return total + getInvestmentEstimatedActiveCurrentValue(investment)
      },
      0,
    ),
    totalEstimatedAccruedReturn: investments.reduce((total, investment) => {
      return total + investment.estimatedAccruedReturn
    }, 0),
    activeInvestmentCount: activeInvestments.length,
    finishedInvestmentCount: investments.filter((investment) => {
      return investment.derivedStatus === DERIVED_STATUSES.finished
    }).length,
    totalEstimatedDailyReturn: activeInvestments.reduce((total, investment) => {
      return (
        total +
        getEstimatedInterestForDays(
          investment.currentInvestedAmount,
          investment.annualRate,
          1,
        )
      )
    }, 0),
    totalEstimatedMonthlyReturn: activeInvestments.reduce(
      (total, investment) => {
        return (
          total +
          getEstimatedMonthlyInterest(
            investment.currentInvestedAmount,
            investment.annualRate,
          )
        )
      },
      0,
    ),
    totalEstimatedYearlyReturn: activeInvestments.reduce(
      (total, investment) => {
        return (
          total +
          getEstimatedYearlyInterest(
            investment.currentInvestedAmount,
            investment.annualRate,
          )
        )
      },
      0,
    ),
  }
}

export function getInvestmentEstimatedActiveCurrentValue(
  investment: ResolvedInvestment,
): number {
  if (investment.derivedStatus === DERIVED_STATUSES.finished) {
    return 0
  }

  return investment.estimatedCurrentValue
}
