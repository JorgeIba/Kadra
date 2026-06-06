import {
  INVESTMENT_TYPES,
  compareCalendarDatesAscending,
  getDaysBetween,
  isOnOrAfterDate,
  toDateString,
  type FixedTermInvestment,
  type Investment,
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
  investments: Investment[],
  asOfDate: Date,
): MaturityTimelineItem[] {
  const asOfDateString = toDateString(asOfDate)

  return investments
    .filter((investment): investment is FixedTermInvestment => {
      return isUpcomingFixedTermInvestment(investment, asOfDate)
    })
    .sort((leftInvestment, rightInvestment) => {
      return compareCalendarDatesAscending(
        leftInvestment.endDate,
        rightInvestment.endDate,
      )
    })
    .slice(0, MATURITY_TIMELINE_LIMIT)
    .map((investment) => {
      return {
        id: investment.id,
        name: investment.name,
        institutionName: investment.institutionName,
        endDate: investment.endDate,
        daysRemaining: getDaysBetween(asOfDateString, investment.endDate),
      }
    })
}

function isUpcomingFixedTermInvestment(
  investment: Investment,
  asOfDate: Date,
): investment is FixedTermInvestment {
  return (
    investment.type === INVESTMENT_TYPES.fixedTerm &&
    !isOnOrAfterDate(asOfDate, investment.endDate)
  )
}
