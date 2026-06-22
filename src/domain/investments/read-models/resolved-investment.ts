import {
  getPaymentFrequencyDays,
  INVESTMENT_TYPES,
} from "@/domain/investments/model/constants"
import {
  compareCalendarDatesAscending,
  getDaysBetween,
  parseCalendarDate,
  toDateString,
} from "@/domain/investments/calculations/dates"
import {
  analyzeInvestment,
  type InvestmentAnalysis,
} from "@/domain/investments/calculations/investment-analysis"
import { getUpcomingInvestmentProjectedEarningsForDays } from "@/domain/investments/calculations/investment-projections"
import type {
  BaseResolvedInvestment,
  CalendarDateString,
  FixedTermResolvedInvestment,
  Investment,
  InvestmentSummary,
  InvestmentLifecyclePeriod,
  ResolvedInvestment,
} from "@/domain/investments/model/types"

export function resolveInvestment(
  investment: Investment,
  asOfDate = new Date(),
): ResolvedInvestment {
  const analysis = analyzeInvestment(investment, asOfDate)
  const asOfDateString = toDateString(asOfDate)
  const activeLifecyclePeriod = getCurrentLifecyclePeriodOrThrow(analysis)
  const currentBalanceSegment = getCurrentBalanceSegmentOrThrow(analysis)
  const effectiveEndDate =
    activeLifecyclePeriod.type === INVESTMENT_TYPES.fixedTerm &&
    compareCalendarDatesAscending(
      asOfDateString,
      activeLifecyclePeriod.endDate,
    ) >= 0
      ? activeLifecyclePeriod.endDate
      : asOfDateString
  const commonValues: BaseResolvedInvestment = {
    id: investment.id,
    name: investment.name,
    institutionName: investment.institutionName,
    currency: investment.currency,
    notes: investment.notes,
    createdAt: investment.createdAt,
    updatedAt: investment.updatedAt,
    originalAmount: analysis.originalAmount,
    currentInvestedAmount: analysis.currentInvestedAmount,
    annualRate: currentBalanceSegment.ratePeriod.annualRate,
    paymentFrequency: currentBalanceSegment.lifecyclePeriod.paymentFrequency,
    reinvestmentBehavior:
      currentBalanceSegment.lifecyclePeriod.reinvestmentBehavior,
    startDate: activeLifecyclePeriod.startDate,
    derivedStatus: analysis.derivedStatus,
    currentLifecycleDaysActive: getDaysBetween(
      activeLifecyclePeriod.startDate,
      effectiveEndDate,
    ),
    estimatedAccruedReturn: analysis.estimatedAccruedReturn,
    estimatedCurrentValue: analysis.estimatedCurrentValue,
    estimatedPeriodicReturn: getUpcomingInvestmentProjectedEarningsForDays(
      investment,
      getPaymentFrequencyDays(
        currentBalanceSegment.lifecyclePeriod.paymentFrequency,
      ),
      asOfDate,
    ),
  }

  if (activeLifecyclePeriod.type === INVESTMENT_TYPES.openEnded) {
    return {
      ...commonValues,
      type: INVESTMENT_TYPES.openEnded,
    }
  }

  return resolveFixedTermInvestment(
    commonValues,
    investment,
    activeLifecyclePeriod.endDate,
    asOfDateString,
  )
}

export function getInvestmentSummary(
  investment: Investment,
  asOfDate = new Date(),
): InvestmentSummary {
  return getResolvedInvestmentSummary(resolveInvestment(investment, asOfDate))
}

export function getResolvedInvestmentSummary(
  resolvedInvestment: ResolvedInvestment,
): InvestmentSummary {
  const commonSummaryFields = {
    id: resolvedInvestment.id,
    name: resolvedInvestment.name,
    institutionName: resolvedInvestment.institutionName,
    originalAmount: resolvedInvestment.originalAmount,
    annualRate: resolvedInvestment.annualRate,
    currency: resolvedInvestment.currency,
    estimatedCurrentValue: resolvedInvestment.estimatedCurrentValue,
    derivedStatus: resolvedInvestment.derivedStatus,
  }

  if (resolvedInvestment.type === INVESTMENT_TYPES.fixedTerm) {
    return {
      ...commonSummaryFields,
      type: INVESTMENT_TYPES.fixedTerm,
      progressPercentage: resolvedInvestment.progressPercentage,
    }
  }

  return {
    ...commonSummaryFields,
    type: INVESTMENT_TYPES.openEnded,
  }
}

function resolveFixedTermInvestment(
  commonValues: BaseResolvedInvestment,
  investment: Investment,
  endDate: CalendarDateString,
  asOfDateString: CalendarDateString,
): FixedTermResolvedInvestment {
  const totalTermDays = getDaysBetween(commonValues.startDate, endDate)
  const elapsedTermDays = Math.min(
    commonValues.currentLifecycleDaysActive,
    totalTermDays,
  )
  const daysRemaining = Math.max(0, getDaysBetween(asOfDateString, endDate))
  const projectedAnalysis = analyzeInvestment(
    investment,
    parseCalendarDate(endDate),
  )
  const projectedTotalReturnAtEndDate = projectedAnalysis.estimatedAccruedReturn

  return {
    ...commonValues,
    type: INVESTMENT_TYPES.fixedTerm,
    endDate,
    totalTermDays,
    daysRemaining,
    progressPercentage:
      totalTermDays === 0
        ? 100
        : Math.min(100, (elapsedTermDays / totalTermDays) * 100),
    projectedTotalReturnAtEndDate,
    projectedValueAtEndDate: projectedAnalysis.estimatedCurrentValue,
  }
}

function getCurrentLifecyclePeriodOrThrow(
  analysis: InvestmentAnalysis,
): InvestmentLifecyclePeriod {
  const lifecyclePeriod = analysis.currentLifecyclePeriod

  if (lifecyclePeriod === null) {
    throw new Error(
      `Investment ${analysis.investment.id} has no lifecycle period at ${analysis.asOfDate.toISOString()}`,
    )
  }

  return lifecyclePeriod
}

function getCurrentBalanceSegmentOrThrow(analysis: InvestmentAnalysis) {
  const currentBalanceSegment = analysis.currentBalanceSegment

  if (currentBalanceSegment === null) {
    throw new Error(
      `Investment ${analysis.investment.id} has no balance segment at ${analysis.asOfDate.toISOString()}`,
    )
  }

  return currentBalanceSegment
}
