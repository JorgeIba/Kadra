import { describe, expect, it } from "vitest"
import {
  CURRENCIES,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
  type Investment,
} from "@/domain/investments"
import { getPortfolioProjectionPoints } from "@/app/screens/dashboard/portfolio-projection"

const startDate = new Date("2026-06-05T12:00:00.000Z")

describe("portfolio projection", () => {
  it("builds chart points for the agreed projection horizons", () => {
    const points = getPortfolioProjectionPoints([investment], startDate)

    expect(
      points.map((point) => {
        return { date: point.date, label: point.label }
      }),
    ).toEqual([
      { date: "2026-06-05", label: "Today" },
      { date: "2026-07-05", label: "30 days" },
      { date: "2026-09-03", label: "90 days" },
      { date: "2026-12-02", label: "180 days" },
      { date: "2027-06-05", label: "1 year" },
    ])
  })

  it("projects known values for a positive-rate investment", () => {
    const points = getPortfolioProjectionPoints([investment], startDate)

    expect(points[0].estimatedValue).toBe(10_000)
    expect(points.at(-1)?.estimatedValue).toBeCloseTo(11_047.244536)
  })
})

const investment: Investment = {
  createdAt: "2026-06-05T12:00:00.000Z",
  currency: CURRENCIES.mxn,
  id: "projection-investment",
  institutionName: "CETES",
  name: "Projection investment",
  updatedAt: "2026-06-05T12:00:00.000Z",
  contributionEvents: [
    {
      id: "projection-contribution-event-1",
      amount: 10_000,
      effectiveDate: "2026-06-05",
      createdAt: "2026-06-05T12:00:00.000Z",
    },
  ],
  rateEvents: [
    {
      id: "projection-rate-event-1",
      annualRate: 10,
      effectiveDate: "2026-06-05",
      createdAt: "2026-06-05T12:00:00.000Z",
    },
  ],
  lifecycleEvents: [
    {
      id: "projection-lifecycle-event-1",
      type: INVESTMENT_TYPES.openEnded,
      paymentFrequency: PAYMENT_FREQUENCIES.monthly,
      reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
      effectiveDate: "2026-06-05",
      createdAt: "2026-06-05T12:00:00.000Z",
    },
  ],
}
