import { getEstimatedInterestForDays } from "@/domain/investments/interest"
import {
  getEstimatedMonthlyInterest,
  getEstimatedYearlyInterest,
} from "@/domain/investments/interest"
import {
  analyzeInvestment,
  type InvestmentAnalysis,
} from "@/domain/investments/investment-analysis"
import type { Investment } from "@/domain/investments/types"

export interface PortfolioAnalysis {
  investments: InvestmentAnalysis[]
  totalEstimatedCurrentValue: number
  totalEstimatedAccruedReturn: number
  activeInvestmentCount: number
  totalEstimatedDailyReturn: number
  totalEstimatedMonthlyReturn: number
  totalEstimatedYearlyReturn: number
}

export function analyzePortfolio(
  investments: Investment[],
  asOfDate = new Date(),
): PortfolioAnalysis {
  const investmentAnalyses = investments.map((investment) =>
    analyzeInvestment(investment, asOfDate),
  )

  return {
    investments: investmentAnalyses,
    totalEstimatedCurrentValue: investmentAnalyses.reduce((total, analysis) => {
      return total + analysis.estimatedCurrentValue
    }, 0),
    totalEstimatedAccruedReturn: investmentAnalyses.reduce((total, analysis) => {
      return total + analysis.estimatedAccruedReturn
    }, 0),
    activeInvestmentCount: investmentAnalyses.filter((analysis) => {
      return analysis.derivedStatus === "active"
    }).length,
    totalEstimatedDailyReturn: investmentAnalyses.reduce((total, analysis) => {
      if (analysis.currentAnnualRate === null) {
        return total
      }

      return (
        total +
        getEstimatedInterestForDays(
          analysis.currentInvestedAmount,
          analysis.currentAnnualRate,
          1,
        )
      )
    }, 0),
    totalEstimatedMonthlyReturn: investmentAnalyses.reduce((total, analysis) => {
      if (analysis.currentAnnualRate === null) {
        return total
      }

      return (
        total +
        getEstimatedMonthlyInterest(
          analysis.currentInvestedAmount,
          analysis.currentAnnualRate,
        )
      )
    }, 0),
    totalEstimatedYearlyReturn: investmentAnalyses.reduce((total, analysis) => {
      if (analysis.currentAnnualRate === null) {
        return total
      }

      return (
        total +
        getEstimatedYearlyInterest(
          analysis.currentInvestedAmount,
          analysis.currentAnnualRate,
        )
      )
    }, 0),
  }
}
