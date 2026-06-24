import { analyzePortfolio } from "@/domain/investments/read-models/portfolio-analysis"
import type { ResolvedInvestment } from "@/domain/investments/model/types"

export function getPortfolioEstimatedCurrentValue(
  investments: ResolvedInvestment[],
): number {
  return analyzePortfolio(investments).totalEstimatedCurrentValue
}

export function getPortfolioEstimatedAccruedReturn(
  investments: ResolvedInvestment[],
): number {
  return analyzePortfolio(investments).totalEstimatedAccruedReturn
}

export function getActiveInvestmentCount(
  investments: ResolvedInvestment[],
): number {
  return analyzePortfolio(investments).activeInvestmentCount
}

export function getFinishedInvestmentCount(
  investments: ResolvedInvestment[],
): number {
  return analyzePortfolio(investments).finishedInvestmentCount
}

export function getInvestmentCount(investments: ResolvedInvestment[]): number {
  return analyzePortfolio(investments).investmentCount
}

export function getPortfolioEstimatedDailyReturn(
  investments: ResolvedInvestment[],
): number {
  return analyzePortfolio(investments).totalEstimatedDailyReturn
}

export function getPortfolioEstimatedMonthlyReturn(
  investments: ResolvedInvestment[],
): number {
  return analyzePortfolio(investments).totalEstimatedMonthlyReturn
}

export function getPortfolioEstimatedYearlyReturn(
  investments: ResolvedInvestment[],
): number {
  return analyzePortfolio(investments).totalEstimatedYearlyReturn
}
