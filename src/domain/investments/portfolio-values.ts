import { analyzePortfolio } from "@/domain/investments/portfolio-analysis"
import type { Investment } from "@/domain/investments/types"

export function getPortfolioEstimatedCurrentValue(
  investments: Investment[],
  asOfDate = new Date(),
): number {
  return analyzePortfolio(investments, asOfDate).totalEstimatedCurrentValue
}

export function getPortfolioEstimatedAccruedReturn(
  investments: Investment[],
  asOfDate = new Date(),
): number {
  return analyzePortfolio(investments, asOfDate).totalEstimatedAccruedReturn
}

export function getActiveInvestmentCount(
  investments: Investment[],
  asOfDate = new Date(),
): number {
  return analyzePortfolio(investments, asOfDate).activeInvestmentCount
}

export function getPortfolioEstimatedDailyReturn(
  investments: Investment[],
  asOfDate = new Date(),
): number {
  return analyzePortfolio(investments, asOfDate).totalEstimatedDailyReturn
}

export function getPortfolioEstimatedMonthlyReturn(
  investments: Investment[],
  asOfDate = new Date(),
): number {
  return analyzePortfolio(investments, asOfDate).totalEstimatedMonthlyReturn
}

export function getPortfolioEstimatedYearlyReturn(
  investments: Investment[],
  asOfDate = new Date(),
): number {
  return analyzePortfolio(investments, asOfDate).totalEstimatedYearlyReturn
}
