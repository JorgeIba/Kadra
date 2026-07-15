import { analyzePortfolio } from "@/domain/investments/read-models/portfolio-analysis"
import { resolveInvestment } from "@/domain/investments/read-models/resolved-investment"
import { toDateString } from "@/domain/investments/calculations/dates"
import {
  DERIVED_STATUSES,
  REINVESTMENT_STRATEGIES,
  type InvestmentType,
  type ReinvestmentStrategy,
} from "@/domain/investments/model/constants"
import { projectInvestmentWithStrategy } from "@/domain/investments/calculations/projection-strategies"
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
  totalExtraCash: number
  totalExcludedValue: number
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
  type: InvestmentType
  projectedEarnings: number
  projectedValue: number
}

export function projectPortfolioAtDate(
  investments: Investment[],
  projectionDate: Date,
  baselineDate = new Date(),
  strategy: ReinvestmentStrategy = REINVESTMENT_STRATEGIES.reinvest,
): PortfolioProjectionReadModel {
  const baselineDateString = toDateString(baselineDate)
  const projectionDateString = toDateString(projectionDate)

  // Map each raw investment to a strategy-resolved state:
  // { baseline, projected, projectedValue, cashGenerated }.
  // We resolve the UI presentation details (baseline/projected snapshots) here in the read-model layer.
  const projectedStates = investments.map((investment) => {
    const calc = projectInvestmentWithStrategy(
      investment,
      baselineDate,
      projectionDate,
      strategy,
    )

    const baselineResolved = resolveInvestment(investment, baselineDate)
    const projectedResolved = resolveInvestment(
      calc.projectedInvestment,
      projectionDate,
    )

    return {
      baseline: baselineResolved,
      projected: projectedResolved,
      projectedValue: calc.projectedValue,
      cashGenerated: calc.cashGenerated,
      excludedValue: calc.excludedValue,
    }
  })

  // Extract baseline and projected resolved investments to run portfolio analytics
  const baselineInvestments = projectedStates.map(({ baseline }) => baseline)
  const projectedInvestments = projectedStates.map(({ projected }) => projected)

  const baselinePortfolio = analyzePortfolio(baselineInvestments)
  const projectedPortfolio = analyzePortfolio(projectedInvestments)

  // Filter out finished/matured investments to get interest rates and returns for active assets only
  const activeProjectedPortfolio = analyzePortfolio(
    projectedInvestments.filter((investment) => {
      return investment.derivedStatus === DERIVED_STATUSES.active
    }),
  )

  // Calculate any extra cash generated during the projection window (e.g. keep-as-cash matured balance)
  const totalExtraCash = projectedStates.reduce(
    (sum, item) => sum + item.cashGenerated,
    0,
  )

  const totalExcludedValue = projectedStates.reduce(
    (sum, item) => sum + item.excludedValue,
    0,
  )

  return {
    baselineDate: baselineDateString,
    projectionDate: projectionDateString,
    totalExtraCash,
    totalExcludedValue,
    // Total estimated portfolio value is the active assets' value plus any cash generated from matured assets
    estimatedValue:
      projectedPortfolio.totalEstimatedCurrentValue + totalExtraCash,
    estimatedAccruedReturn: projectedPortfolio.totalEstimatedAccruedReturn,
    // Projected earnings is the difference in total interest accumulated during the window
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
    investments: projectedStates.map(
      ({ baseline, projected, projectedValue }) => {
        return {
          investmentId: projected.id,
          name: projected.name,
          institutionName: projected.institutionName,
          type: projected.type,
          projectedEarnings:
            projected.estimatedAccruedReturn - baseline.estimatedAccruedReturn,
          projectedValue,
        }
      },
    ),
  }
}
