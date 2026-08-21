import {
  addCalendarDays,
  compareCalendarDatesAscending,
  getDaysBetween,
  getInvestmentActiveLifecyclePeriodAtDate,
  isFixedTermMaturingBetweenDates,
  INVESTMENT_TYPES,
  parseCalendarDate,
  projectPortfolioAtDate,
  toDateString,
  REINVESTMENT_STRATEGIES,
  type CalendarDateString,
  type Investment,
  type InvestmentType,
  type PortfolioProjectionEarningPaceReadModel,
  type ReinvestmentStrategy,
} from "@/domain/investments"

export interface PortfolioProjectionPoint {
  date: CalendarDateString
  label: string
  estimatedValue: number
  projectedEarnings: number
}

export interface InvestmentProjectionBreakdownItem {
  investmentId: string
  name: string
  institutionName: string
  type: InvestmentType
  projectedEarnings: number
  projectedValue: number
  percentage: number
}

export type PortfolioProjectionValueRelation = "higher" | "lower" | "equal"

export interface PortfolioProjectionComparison {
  metric: "projected-portfolio-value"
  selectedStrategy: ReinvestmentStrategy
  referenceStrategy: ReinvestmentStrategy
  selectedValue: number
  referenceValue: number
  deltaFromReference: number
  relationToReference: PortfolioProjectionValueRelation
}

export interface PortfolioProjectionSnapshot {
  targetDate: CalendarDateString
  currentValue: number
  projectedValue: number
  projectedEarnings: number
  investmentCount: number
  activeInvestmentCount: number
  finishedInvestmentCount: number
  earningPace: PortfolioProjectionEarningPaceReadModel
  points: PortfolioProjectionPoint[]
  breakdown: InvestmentProjectionBreakdownItem[]
  reinvestmentStrategy: ReinvestmentStrategy
  hasMaturityScenario: boolean
  maturedCash: number
  excludedValue: number
  comparison: PortfolioProjectionComparison | null
}

const PROJECTION_POINT_COUNT = 6
const PROJECTION_REFERENCE_STRATEGY = REINVESTMENT_STRATEGIES.reinvest

export function getDefaultProjectionTargetDate(asOfDate = new Date()) {
  return addCalendarDays(asOfDate, 365)
}

export function getPortfolioProjectionSnapshot(
  investments: Investment[],
  asOfDate = new Date(),
  targetDate: CalendarDateString = getDefaultProjectionTargetDate(asOfDate),
  strategy: ReinvestmentStrategy = REINVESTMENT_STRATEGIES.reinvest,
): PortfolioProjectionSnapshot {
  const asOfDateString = toDateString(asOfDate)
  const resolvedTargetDate =
    compareCalendarDatesAscending(targetDate, asOfDateString) < 0
      ? asOfDateString
      : targetDate
  const targetDateObject = parseCalendarDate(resolvedTargetDate)
  const currentProjection = projectPortfolioAtDate(
    investments,
    asOfDate,
    asOfDate,
    strategy,
  )
  const targetProjection = projectPortfolioAtDate(
    investments,
    targetDateObject,
    asOfDate,
    strategy,
  )
  const referenceTargetProjection =
    strategy === PROJECTION_REFERENCE_STRATEGY
      ? targetProjection
      : projectPortfolioAtDate(
          investments,
          targetDateObject,
          asOfDate,
          PROJECTION_REFERENCE_STRATEGY,
        )
  const comparison =
    strategy === PROJECTION_REFERENCE_STRATEGY
      ? null
      : createPortfolioProjectionComparison({
          selectedStrategy: strategy,
          selectedValue: targetProjection.estimatedValue,
          referenceStrategy: PROJECTION_REFERENCE_STRATEGY,
          referenceValue: referenceTargetProjection.estimatedValue,
        })

  // Calculate the breakdown of projected earnings by investment
  // and how much each investment contributes to the total projected earnings.
  // Sort the breakdown by projected earnings in descending order.
  const breakdown = targetProjection.investments
    .map((investment) => {
      return {
        ...investment,
        percentage:
          targetProjection.projectedEarnings === 0
            ? 0
            : (investment.projectedEarnings /
                targetProjection.projectedEarnings) *
              100,
      }
    })
    .sort((left, right) => {
      return (
        right.projectedEarnings - left.projectedEarnings ||
        left.name.localeCompare(right.name)
      )
    })

  return {
    targetDate: resolvedTargetDate,
    currentValue: currentProjection.estimatedValue,
    projectedValue: targetProjection.estimatedValue,
    projectedEarnings: targetProjection.projectedEarnings,
    investmentCount: targetProjection.investmentCount,
    activeInvestmentCount: targetProjection.activeInvestmentCount,
    finishedInvestmentCount: targetProjection.finishedInvestmentCount,
    earningPace: targetProjection.earningPace,
    points: getProjectionPoints(
      investments,
      asOfDate,
      resolvedTargetDate,
      strategy,
    ),
    breakdown,
    reinvestmentStrategy: strategy,
    hasMaturityScenario: investments.some((investment) => {
      const activeLifecycle = getInvestmentActiveLifecyclePeriodAtDate(
        investment,
        asOfDate,
      )

      return (
        activeLifecycle?.type === INVESTMENT_TYPES.fixedTerm &&
        isFixedTermMaturingBetweenDates(
          investment,
          asOfDateString,
          resolvedTargetDate,
        )
      )
    }),
    maturedCash: targetProjection.totalExtraCash,
    excludedValue: targetProjection.totalExcludedValue,
    comparison,
  }
}

export function createPortfolioProjectionComparison({
  selectedStrategy,
  selectedValue,
  referenceStrategy,
  referenceValue,
}: {
  selectedStrategy: ReinvestmentStrategy
  selectedValue: number
  referenceStrategy: ReinvestmentStrategy
  referenceValue: number
}): PortfolioProjectionComparison {
  const selectedValueInCents = Math.round(selectedValue * 100)
  const referenceValueInCents = Math.round(referenceValue * 100)
  const deltaFromReference =
    (selectedValueInCents - referenceValueInCents) / 100

  return {
    metric: "projected-portfolio-value",
    selectedStrategy,
    referenceStrategy,
    selectedValue,
    referenceValue,
    deltaFromReference,
    relationToReference:
      selectedValueInCents === referenceValueInCents
        ? "equal"
        : selectedValueInCents > referenceValueInCents
          ? "higher"
          : "lower",
  }
}

function getProjectionPoints(
  investments: Investment[],
  asOfDate: Date,
  targetDate: CalendarDateString,
  strategy: ReinvestmentStrategy,
): PortfolioProjectionPoint[] {
  const startDate = toDateString(asOfDate)
  const totalDays = getDaysBetween(startDate, targetDate)
  const pointCount = Math.min(PROJECTION_POINT_COUNT, totalDays + 1)

  if (pointCount <= 1) {
    return [
      getProjectionPoint(investments, asOfDate, asOfDate, "Today", strategy),
    ]
  }

  // Generate projection points evenly spaced between the asOfDate and the targetDate.
  return Array.from({ length: pointCount }, (_, index) => {
    const dayOffset = Math.round((totalDays / (pointCount - 1)) * index)
    const pointDate = parseCalendarDate(addCalendarDays(asOfDate, dayOffset))

    return getProjectionPoint(
      investments,
      asOfDate,
      pointDate,
      getProjectionPointLabel(index, pointCount, dayOffset, totalDays),
      strategy,
    )
  })
}

function getProjectionPoint(
  investments: Investment[],
  asOfDate: Date,
  projectionDate: Date,
  label: string,
  strategy: ReinvestmentStrategy,
): PortfolioProjectionPoint {
  const projection = projectPortfolioAtDate(
    investments,
    projectionDate,
    asOfDate,
    strategy,
  )

  return {
    date: projection.projectionDate,
    label,
    estimatedValue: projection.estimatedValue,
    projectedEarnings: projection.projectedEarnings,
  }
}

function getProjectionPointLabel(
  index: number,
  pointCount: number,
  dayOffset: number,
  totalDays: number,
) {
  if (index === 0) {
    return "Today"
  }

  if (totalDays === 1 && index === pointCount - 1) {
    return "Tomorrow"
  }

  if (index === pointCount - 1) {
    return "Target"
  }

  if (totalDays <= 31) {
    return `${dayOffset}d`
  }

  if (totalDays <= 120) {
    return `${Math.max(1, Math.round(dayOffset / 7))}w`
  }

  if (totalDays <= 2 * 365) {
    return `${Math.max(1, Math.round(dayOffset / 30))}mo`
  }

  return `${Math.max(1, Math.round(dayOffset / 365))}y`
}
