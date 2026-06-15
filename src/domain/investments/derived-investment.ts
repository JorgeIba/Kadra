import { INVESTMENT_TYPES } from "@/domain/investments/constants"
import {
  compareCalendarDatesAscending,
  getDaysBetween,
  parseCalendarDate,
  toDateString,
} from "@/domain/investments/dates"
import { analyzeInvestment } from "@/domain/investments/investment-analysis"
import { getEstimatedPeriodicReturn } from "@/domain/investments/investment-returns"
import { getActiveLifecyclePeriodAtDate } from "@/domain/investments/timeline-segments"
import type {
  BaseDerivedInvestment,
  CalendarDateString,
  DerivedInvestment,
  FixedTermDerivedInvestment,
  Investment,
  InvestmentLifecyclePeriod,
  InvestmentSummary,
} from "@/domain/investments/types"

export function getInvestmentDerivedValues(
  investment: Investment,
  asOfDate = new Date(),
): DerivedInvestment {
  const analysis = analyzeInvestment(investment, asOfDate)
  const asOfDateString = toDateString(asOfDate)
  const activeLifecyclePeriod = getActiveLifecyclePeriodOrThrow(
    investment,
    analysis.lastActiveDate,
  )
  const currentBalanceSegment = getCurrentBalanceSegmentOrThrow(analysis)
  const effectiveEndDate =
    activeLifecyclePeriod.type === INVESTMENT_TYPES.fixedTerm &&
    compareCalendarDatesAscending(
      asOfDateString,
      activeLifecyclePeriod.endDate,
    ) >= 0
      ? activeLifecyclePeriod.endDate
      : asOfDateString
  const commonValues: BaseDerivedInvestment = {
    id: investment.id,
    name: investment.name,
    institutionName: investment.institutionName,
    currency: investment.currency,
    notes: investment.notes,
    originalAmount: analysis.originalAmount,
    currentInvestedAmount: analysis.currentInvestedAmount,
    annualRate: currentBalanceSegment.annualRate,
    paymentFrequency: currentBalanceSegment.paymentFrequency,
    reinvestmentBehavior: currentBalanceSegment.reinvestmentBehavior,
    startDate: activeLifecyclePeriod.startDate,
    derivedStatus: analysis.derivedStatus,
    currentLifecycleDaysActive: getDaysBetween(
      activeLifecyclePeriod.startDate,
      effectiveEndDate,
    ),
    estimatedAccruedReturn: analysis.estimatedAccruedReturn,
    estimatedCurrentValue: analysis.estimatedCurrentValue,
    estimatedPeriodicReturn: getEstimatedPeriodicReturn(investment, asOfDate),
  }

  if (activeLifecyclePeriod.type === INVESTMENT_TYPES.openEnded) {
    return {
      ...commonValues,
      type: INVESTMENT_TYPES.openEnded,
    }
  }

  return getFixedTermDerivedValues(
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
  const derivedValues = getInvestmentDerivedValues(investment, asOfDate)

  const commonSummaryFields = {
    id: investment.id,
    name: investment.name,
    institutionName: investment.institutionName,
    originalAmount: derivedValues.originalAmount,
    annualRate: derivedValues.annualRate,
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

function getFixedTermDerivedValues(
  commonValues: BaseDerivedInvestment,
  investment: Investment,
  endDate: CalendarDateString,
  asOfDateString: CalendarDateString,
): FixedTermDerivedInvestment {
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

function getActiveLifecyclePeriodOrThrow(
  investment: Investment,
  asOfDate: CalendarDateString,
): InvestmentLifecyclePeriod {
  const lifecyclePeriod = getActiveLifecyclePeriodAtDate(investment, asOfDate)

  if (lifecyclePeriod === null) {
    throw new Error(
      `Investment ${investment.id} has no active lifecycle period at ${asOfDate}`,
    )
  }

  return lifecyclePeriod
}

function getCurrentBalanceSegmentOrThrow(
  analysis: ReturnType<typeof analyzeInvestment>,
) {
  const currentBalanceSegment = analysis.currentBalanceSegment

  if (currentBalanceSegment === null) {
    throw new Error(
      `Investment ${analysis.investment.id} has no balance segment at ${analysis.asOfDate.toISOString()}`,
    )
  }

  return currentBalanceSegment
}
