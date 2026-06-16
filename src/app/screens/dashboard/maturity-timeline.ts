import {
  compareCalendarDatesAscending,
  DERIVED_STATUSES,
  getDaysBetween,
  INVESTMENT_TYPES,
  toDateString,
  type FixedTermResolvedInvestment,
  type ResolvedInvestment,
} from "@/domain/investments"

const MATURITY_TIMELINE_LIMIT = 3

export interface MaturityTimelineItem {
  id: string
  name: string
  institutionName: string
  endDate: string
  daysRemaining: number
}

export function getMaturityTimelineItems(
  investments: ResolvedInvestment[],
  asOfDate: Date,
): MaturityTimelineItem[] {
  const asOfDateString = toDateString(asOfDate)

  return investments
    .filter(
      (
        resolvedInvestment,
      ): resolvedInvestment is FixedTermResolvedInvestment => {
        return (
          resolvedInvestment.type === INVESTMENT_TYPES.fixedTerm &&
          resolvedInvestment.derivedStatus === DERIVED_STATUSES.active
        )
      },
    )
    .sort((leftInvestment, rightInvestment) => {
      return compareCalendarDatesAscending(
        leftInvestment.endDate,
        rightInvestment.endDate,
      )
    })
    .slice(0, MATURITY_TIMELINE_LIMIT)
    .map((resolvedInvestment) => {
      return {
        id: resolvedInvestment.id,
        name: resolvedInvestment.name,
        institutionName: resolvedInvestment.institutionName,
        endDate: resolvedInvestment.endDate,
        daysRemaining: getDaysBetween(
          asOfDateString,
          resolvedInvestment.endDate,
        ),
      }
    })
}
