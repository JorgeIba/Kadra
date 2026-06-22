import { getEstimatedInterestForDays } from "@/domain/investments/calculations/interest"
import {
  getEstimatedMonthlyInterest,
  getEstimatedYearlyInterest,
} from "@/domain/investments/calculations/interest"
import { DERIVED_STATUSES } from "@/domain/investments/model/constants"
import type { ResolvedInvestment } from "@/domain/investments/model/types"

export interface PortfolioAnalysis {
  investments: ResolvedInvestment[]
  totalEstimatedCurrentValue: number
  totalEstimatedAccruedReturn: number
  activeInvestmentCount: number
  totalEstimatedDailyReturn: number
  totalEstimatedMonthlyReturn: number
  totalEstimatedYearlyReturn: number
}

export function analyzePortfolio(
  investments: ResolvedInvestment[],
): PortfolioAnalysis {
  return {
    investments,
    totalEstimatedCurrentValue: investments.reduce((total, investment) => {
      return total + investment.estimatedCurrentValue
    }, 0),
    totalEstimatedAccruedReturn: investments.reduce((total, investment) => {
      return total + investment.estimatedAccruedReturn
    }, 0),
    activeInvestmentCount: investments.filter((investment) => {
      return investment.derivedStatus === DERIVED_STATUSES.active
    }).length,
    totalEstimatedDailyReturn: investments.reduce((total, investment) => {
      return (
        total +
        getEstimatedInterestForDays(
          investment.currentInvestedAmount,
          investment.annualRate,
          1,
        )
      )
    }, 0),
    totalEstimatedMonthlyReturn: investments.reduce((total, investment) => {
      return (
        total +
        getEstimatedMonthlyInterest(
          investment.currentInvestedAmount,
          investment.annualRate,
        )
      )
    }, 0),
    totalEstimatedYearlyReturn: investments.reduce((total, investment) => {
      return (
        total +
        getEstimatedYearlyInterest(
          investment.currentInvestedAmount,
          investment.annualRate,
        )
      )
    }, 0),
  }
}
