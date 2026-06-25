import { describe, expect, it } from "vitest"
import {
  EARNED_MONEY_SORT_OPTIONS,
  getPortfolioEarnedMoneySnapshot,
} from "@/app/screens/earnings/earnings-view-model"
import {
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
} from "@/domain/investments"
import {
  fixedInvestment,
  openEndedInvestment,
} from "@/domain/investments/dev/investment-test-fixtures"
import type { Investment } from "@/domain/investments/model/types"

const maturedFixedInvestment = {
  ...fixedInvestment,
  id: "investment-matured",
  name: "Finished fixed term",
  institutionName: "Finished institution",
  createdAt: "2025-11-01T18:00:00.000Z",
  updatedAt: "2025-11-01T18:00:00.000Z",
  contributionEvents: [
    {
      id: "contribution-event-1",
      amount: 20_000,
      effectiveDate: "2025-11-01",
      createdAt: "2025-11-01T18:00:00.000Z",
    },
  ],
  rateEvents: [
    {
      id: "rate-event-1",
      annualRate: 11,
      effectiveDate: "2025-11-01",
      createdAt: "2025-11-01T18:00:00.000Z",
    },
  ],
  lifecycleEvents: [
    {
      id: "lifecycle-event-1",
      type: INVESTMENT_TYPES.fixedTerm,
      paymentFrequency: PAYMENT_FREQUENCIES.atMaturity,
      reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
      effectiveDate: "2025-11-01",
      maturityDate: "2025-12-01",
      createdAt: "2025-11-01T18:00:00.000Z",
    },
  ],
} satisfies Investment

const activeFixedInvestment = {
  ...fixedInvestment,
  id: "investment-fixed",
  name: "Fixed 30 days",
} satisfies Investment

const activeOpenEndedInvestment = {
  ...openEndedInvestment,
  id: "investment-open",
  name: "Open daily",
} satisfies Investment

const investments = [
  maturedFixedInvestment,
  activeFixedInvestment,
  activeOpenEndedInvestment,
]
const asOfDate = new Date("2026-01-16T12:00:00.000Z")

describe("earned money view model", () => {
  it("includes active and finished investments in the earned total", () => {
    const snapshot = getPortfolioEarnedMoneySnapshot(investments, asOfDate)

    expect(snapshot.totalEarnedAmount).toBeCloseTo(360.86395423006536)
    expect(snapshot.investmentCount).toBe(3)
    expect(snapshot.activeInvestmentCount).toBe(2)
    expect(snapshot.finishedInvestmentCount).toBe(1)
  })

  it("sorts breakdown by highest earned by default", () => {
    const snapshot = getPortfolioEarnedMoneySnapshot(investments, asOfDate)

    expect(
      snapshot.breakdown.map((investment) => investment.investmentId),
    ).toEqual(["investment-matured", "investment-fixed", "investment-open"])
    expect(snapshot.breakdown[0]?.earnedAmount).toBeCloseTo(180.82191780821918)
    expect(snapshot.breakdown[1]?.earnedAmount).toBeCloseTo(150)
    expect(snapshot.breakdown[2]?.earnedAmount).toBeCloseTo(30.04203642184619)
  })

  it("can sort breakdown by lowest earned", () => {
    const snapshot = getPortfolioEarnedMoneySnapshot(
      investments,
      asOfDate,
      EARNED_MONEY_SORT_OPTIONS.lowestEarned,
    )

    expect(
      snapshot.breakdown.map((investment) => investment.investmentId),
    ).toEqual(["investment-open", "investment-fixed", "investment-matured"])
  })

  it("can sort breakdown by name", () => {
    const snapshot = getPortfolioEarnedMoneySnapshot(
      investments,
      asOfDate,
      EARNED_MONEY_SORT_OPTIONS.name,
    )

    expect(snapshot.breakdown.map((investment) => investment.name)).toEqual([
      "Finished fixed term",
      "Fixed 30 days",
      "Open daily",
    ])
  })

  it("can sort breakdown by status with active investments first", () => {
    const snapshot = getPortfolioEarnedMoneySnapshot(
      investments,
      asOfDate,
      EARNED_MONEY_SORT_OPTIONS.status,
    )

    expect(
      snapshot.breakdown.map((investment) => investment.investmentId),
    ).toEqual(["investment-fixed", "investment-open", "investment-matured"])
  })

  it("calculates portfolio share per investment from the earned total", () => {
    const snapshot = getPortfolioEarnedMoneySnapshot(investments, asOfDate)

    expect(snapshot.breakdown[0]?.percentage).toBeCloseTo(50.10805753487306)
    expect(snapshot.breakdown[1]?.percentage).toBeCloseTo(41.56640529665531)
    expect(snapshot.breakdown[2]?.percentage).toBeCloseTo(8.32553716847163)
  })
})
