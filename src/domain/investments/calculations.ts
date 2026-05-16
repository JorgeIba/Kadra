import type {
  DerivedStatus,
  FixedTermInvestmentDerivedValues,
  Investment,
  InvestmentDerivedValues,
  InvestmentSummary,
} from "@/domain/investments/types"
import {
  DERIVED_STATUSES,
  INVESTMENT_TYPES,
} from "@/domain/investments/constants"
import {
  getDaysActive,
  getDaysBetween,
  isOnOrAfterDate,
} from "@/domain/investments/dates"
import {
  getEstimatedAccruedReturn,
  getEstimatedPeriodicReturn,
  getSimpleInterest,
} from "@/domain/investments/returns"

export function getDerivedStatus(
  investment: Investment,
  asOfDate = new Date(),
): DerivedStatus {
  if (investment.type === INVESTMENT_TYPES.openEnded) {
    return DERIVED_STATUSES.active
  }

  return isOnOrAfterDate(asOfDate, investment.endDate)
    ? DERIVED_STATUSES.finished
    : DERIVED_STATUSES.active
}

export function getInvestmentDerivedValues(
  investment: Investment,
  asOfDate = new Date(),
): InvestmentDerivedValues {
  const estimatedAccruedReturn = getEstimatedAccruedReturn(investment, asOfDate)
  const commonValues = {
    derivedStatus: getDerivedStatus(investment, asOfDate),
    daysActive: getDaysActive(investment, asOfDate),
    estimatedAccruedReturn,
    estimatedCurrentValue: investment.originalAmount + estimatedAccruedReturn,
    estimatedPeriodicReturn: getEstimatedPeriodicReturn(investment),
  }

  if (investment.type === INVESTMENT_TYPES.openEnded) {
    return {
      ...commonValues,
      type: investment.type,
    }
  }

  // Fixed-Term specific calculations
  const totalTermDays = getDaysBetween(investment.startDate, investment.endDate)
  const elapsedTermDays = Math.min(commonValues.daysActive, totalTermDays)
  const daysRemaining = Math.max(0, totalTermDays - elapsedTermDays)
  const projectedTotalReturnAtEndDate = getSimpleInterest(
    investment.originalAmount,
    investment.annualRate,
    totalTermDays,
  )

  return {
    ...commonValues,
    type: investment.type,
    totalTermDays,
    daysRemaining,
    progressPercentage:
      totalTermDays === 0
        ? 100
        : Math.min(100, (elapsedTermDays / totalTermDays) * 100),
    projectedTotalReturnAtEndDate,
    projectedValueAtEndDate:
      investment.originalAmount + projectedTotalReturnAtEndDate,
  } satisfies FixedTermInvestmentDerivedValues
}

export function getInvestmentSummary(
  investment: Investment,
  asOfDate = new Date(),
): InvestmentSummary {
  const derivedValues = getInvestmentDerivedValues(investment, asOfDate)

  const commonSummaryFields = {
    id: investment.id,
    name: investment.name,
    institutionName: investment.institutionName,
    originalAmount: investment.originalAmount,
    annualRate: investment.annualRate,
    currency: investment.currency,
    estimatedCurrentValue: derivedValues.estimatedCurrentValue,
    derivedStatus: derivedValues.derivedStatus,
  }

  if (derivedValues.type === INVESTMENT_TYPES.fixedTerm) {
    return {
      ...commonSummaryFields,
      type: INVESTMENT_TYPES.fixedTerm,
      progressPercentage: derivedValues.progressPercentage,
    }
  }

  return {
    ...commonSummaryFields,
    type: INVESTMENT_TYPES.openEnded,
  }
}

export function getPortfolioEstimatedCurrentValue(
  investments: Investment[],
  asOfDate = new Date(),
): number {
  return investments.reduce((total, investment) => {
    return (
      total +
      getInvestmentDerivedValues(investment, asOfDate).estimatedCurrentValue
    )
  }, 0)
}

export function getPortfolioEstimatedDailyReturn(
  investments: Investment[],
): number {
  return investments.reduce((total, investment) => {
    return (
      total +
      getSimpleInterest(investment.originalAmount, investment.annualRate, 1)
    )
  }, 0)
}
