import { analyzePortfolio } from "@/domain/investments/read-models/portfolio-analysis"
import { resolveInvestment } from "@/domain/investments/read-models/resolved-investment"
import { toDateString } from "@/domain/investments/calculations/dates"
import { DERIVED_STATUSES } from "@/domain/investments/model/constants"
import type {
  CalendarDateString,
  Investment,
} from "@/domain/investments/model/types"

export interface PortfolioProjectionReadModel {
  baselineDate: CalendarDateString
  projectionDate: CalendarDateString
  estimatedValue: number
  estimatedAccruedReturn: number
  projectedEarnings: number
  investmentCount: number
  activeInvestmentCount: number
  finishedInvestmentCount: number
  earningPace: PortfolioProjectionEarningPaceReadModel
  investments: InvestmentProjectionReadModel[]
}

export interface PortfolioProjectionEarningPaceReadModel {
  daily: number
  monthly: number
  yearly: number
}

export interface InvestmentProjectionReadModel {
  investmentId: string
  name: string
  institutionName: string
  projectedEarnings: number
  projectedValue: number
}

export function projectPortfolioAtDate(
  investments: Investment[],
  projectionDate: Date,
  baselineDate = new Date(),
): PortfolioProjectionReadModel {
  const resolvedInvestments = investments.map((investment) => {
    return {
      baseline: resolveInvestment(investment, baselineDate),
      projected: resolveInvestment(investment, projectionDate),
    }
  })
  const baselineInvestments = resolvedInvestments.map(({ baseline }) => {
    return baseline
  })
  const projectedInvestments = resolvedInvestments.map(({ projected }) => {
    return projected
  })
  const baselinePortfolio = analyzePortfolio(baselineInvestments)
  const projectedPortfolio = analyzePortfolio(projectedInvestments)
  const activeProjectedPortfolio = analyzePortfolio(
    projectedInvestments.filter((investment) => {
      return investment.derivedStatus === DERIVED_STATUSES.active
    }),
  )

  return {
    baselineDate: toDateString(baselineDate),
    projectionDate: toDateString(projectionDate),
    estimatedValue: projectedPortfolio.totalEstimatedCurrentValue,
    estimatedAccruedReturn: projectedPortfolio.totalEstimatedAccruedReturn,
    projectedEarnings:
      projectedPortfolio.totalEstimatedAccruedReturn -
      baselinePortfolio.totalEstimatedAccruedReturn,
    investmentCount: projectedPortfolio.investmentCount,
    activeInvestmentCount: projectedPortfolio.activeInvestmentCount,
    finishedInvestmentCount: projectedPortfolio.finishedInvestmentCount,
    earningPace: {
      daily: activeProjectedPortfolio.totalEstimatedDailyReturn,
      monthly: activeProjectedPortfolio.totalEstimatedMonthlyReturn,
      yearly: activeProjectedPortfolio.totalEstimatedYearlyReturn,
    },
    investments: resolvedInvestments.map(({ baseline, projected }) => {
      return {
        investmentId: projected.id,
        name: projected.name,
        institutionName: projected.institutionName,
        projectedEarnings:
          projected.estimatedAccruedReturn - baseline.estimatedAccruedReturn,
        projectedValue: projected.estimatedCurrentValue,
      }
    }),
  }
}
