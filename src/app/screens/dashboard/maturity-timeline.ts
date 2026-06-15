import {
  compareCalendarDatesAscending,
  getDaysBetween,
  getInvestmentDerivedValues,
  toDateString,
  type FixedTermDerivedInvestment,
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
    // Transitional pairing: the UI still needs raw identity fields plus derived
    // state. This should simplify once we promote the resolved/read-model shape.
    .map((investment) => ({
      investment,
      derivedValues: getInvestmentDerivedValues(investment, asOfDate),
    }))
    .filter(
      (
        item,
      ): item is {
        investment: Investment
        derivedValues: FixedTermDerivedInvestment
      } => {
        const { derivedValues } = item

      return (
        derivedValues.type === "fixed-term" &&
        derivedValues.derivedStatus === "active"
      )
      },
    )
    .sort((leftInvestment, rightInvestment) => {
      return compareCalendarDatesAscending(
        leftInvestment.derivedValues.endDate,
        rightInvestment.derivedValues.endDate,
      )
    })
    .slice(0, MATURITY_TIMELINE_LIMIT)
    .map(({ investment, derivedValues }) => {
      return {
        id: investment.id,
        name: investment.name,
        institutionName: investment.institutionName,
        endDate: derivedValues.endDate,
        daysRemaining: getDaysBetween(asOfDateString, derivedValues.endDate),
      }
    })
}
