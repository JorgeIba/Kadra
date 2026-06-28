import { describe, expect, it } from "vitest"
import {
  CURRENCIES,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
} from "@/domain/investments/model/constants"
import {
  fixedInvestment,
  openEndedInvestment,
} from "@/domain/investments/dev/investment-test-fixtures"
import type { Investment } from "@/domain/investments/model/types"
import { resolveInvestment } from "@/domain/investments/read-models/resolved-investment"
import {
  getActiveInvestmentCount,
  getPortfolioEstimatedAccruedReturn,
  getPortfolioEstimatedCurrentValue,
  getPortfolioEstimatedDailyReturn,
  getPortfolioEstimatedMonthlyReturn,
  getPortfolioEstimatedYearlyReturn,
} from "@/domain/investments/read-models/portfolio-values"

const investments = [fixedInvestment, openEndedInvestment]
const asOfDate = new Date("2026-01-16T12:00:00.000Z")
const resolvedInvestments = investments.map((investment) =>
  resolveInvestment(investment, asOfDate),
)

describe("portfolio values", () => {
  it("aggregates portfolio current value and accrued return", () => {
    expect(getPortfolioEstimatedCurrentValue(resolvedInvestments)).toBeCloseTo(
      46_680.042036,
    )
    expect(getPortfolioEstimatedAccruedReturn(resolvedInvestments)).toBeCloseTo(
      180.042036,
    )
  })

  it("counts active investments", () => {
    expect(getActiveInvestmentCount(resolvedInvestments)).toBe(2)
  })

  it("aggregates daily, monthly, and yearly return estimates", () => {
    expect(getPortfolioEstimatedDailyReturn(resolvedInvestments)).toBeCloseTo(
      12.006,
    )
    expect(getPortfolioEstimatedMonthlyReturn(resolvedInvestments)).toBeCloseTo(
      360.18,
    )
    expect(getPortfolioEstimatedYearlyReturn(resolvedInvestments)).toBeCloseTo(
      4_382.19,
    )
  })

  it("keeps finished investment earnings in history while excluding them from live totals", () => {
    const maturedDate = new Date("2026-06-05T12:00:00.000Z")
    const maturedResolvedInvestments = investments.map((investment) =>
      resolveInvestment(investment, maturedDate),
    )

    expect(
      getPortfolioEstimatedCurrentValue(maturedResolvedInvestments),
    ).toBeCloseTo(maturedResolvedInvestments[1]!.estimatedCurrentValue)
    expect(
      getPortfolioEstimatedAccruedReturn(maturedResolvedInvestments),
    ).toBeGreaterThan(maturedResolvedInvestments[1]!.estimatedAccruedReturn)
  })

  it("does not double-count a reinvested 10k when one investment finished and another stays active", () => {
    const asOfDate = new Date("2026-06-05T12:00:00.000Z")
    const resolvedInvestments = [
      buildFixedTermInvestment({
        annualRate: 6,
        endDate: "2026-05-01",
        id: "finished-10k",
      }),
      buildOpenEndedInvestment({
        annualRate: 8,
        id: "active-10k",
      }),
    ].map((investment) => resolveInvestment(investment, asOfDate))

    expect(getPortfolioEstimatedCurrentValue(resolvedInvestments)).toBeCloseTo(
      resolvedInvestments[1]!.estimatedCurrentValue,
    )
    expect(getPortfolioEstimatedCurrentValue(resolvedInvestments)).toBeLessThan(
      11_000,
    )
    expect(
      getPortfolioEstimatedAccruedReturn(resolvedInvestments),
    ).toBeGreaterThan(resolvedInvestments[1]!.estimatedAccruedReturn)
  })
})

function buildFixedTermInvestment({
  annualRate,
  endDate,
  id,
}: {
  annualRate: number
  endDate: string
  id: string
}): Investment {
  return {
    createdAt: "2026-01-01T12:00:00.000Z",
    currency: CURRENCIES.mxn,
    id,
    institutionName: "CETES",
    name: id,
    updatedAt: "2026-01-01T12:00:00.000Z",
    contributionEvents: [
      {
        id: `${id}-contribution-event-1`,
        amount: 10_000,
        effectiveDate: "2026-01-01",
        createdAt: "2026-01-01T12:00:00.000Z",
      },
    ],
    rateEvents: [
      {
        id: `${id}-rate-event-1`,
        annualRate,
        effectiveDate: "2026-01-01",
        createdAt: "2026-01-01T12:00:00.000Z",
      },
    ],
    lifecycleEvents: [
      {
        id: `${id}-lifecycle-event-1`,
        type: INVESTMENT_TYPES.fixedTerm,
        paymentFrequency: PAYMENT_FREQUENCIES.atMaturity,
        reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
        effectiveDate: "2026-01-01",
        maturityDate: endDate,
        createdAt: "2026-01-01T12:00:00.000Z",
      },
    ],
  }
}

function buildOpenEndedInvestment({
  annualRate,
  id,
}: {
  annualRate: number
  id: string
}): Investment {
  return {
    createdAt: "2026-01-01T12:00:00.000Z",
    currency: CURRENCIES.mxn,
    id,
    institutionName: "Klar",
    name: id,
    updatedAt: "2026-01-01T12:00:00.000Z",
    contributionEvents: [
      {
        id: `${id}-contribution-event-1`,
        amount: 10_000,
        effectiveDate: "2026-01-01",
        createdAt: "2026-01-01T12:00:00.000Z",
      },
    ],
    rateEvents: [
      {
        id: `${id}-rate-event-1`,
        annualRate,
        effectiveDate: "2026-01-01",
        createdAt: "2026-01-01T12:00:00.000Z",
      },
    ],
    lifecycleEvents: [
      {
        id: `${id}-lifecycle-event-1`,
        type: INVESTMENT_TYPES.openEnded,
        paymentFrequency: PAYMENT_FREQUENCIES.daily,
        reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
        effectiveDate: "2026-01-01",
        createdAt: "2026-01-01T12:00:00.000Z",
      },
    ],
  }
}
