import { describe, expect, it } from "vitest"
import {
  CURRENCIES,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
  resolveInvestment,
  type Investment,
} from "@/domain/investments"
import { getSearchedInvestments } from "@/app/screens/assets/assets-search"

const asOfDate = new Date("2026-06-05T12:00:00.000Z")

describe("asset search", () => {
  it("returns all investments for an empty query without reusing the source array", () => {
    const result = getSearchedInvestments(resolvedInvestments, "  ")

    expect(result).toEqual(resolvedInvestments)
    expect(result).not.toBe(resolvedInvestments)
  })

  it("matches investment names, institutions, and notes", () => {
    expect(
      getSearchedInvestments(resolvedInvestments, "Klar").map(
        (investment) => investment.id,
      ),
    ).toEqual(["klar-2", "klar"])

    expect(
      getSearchedInvestments(resolvedInvestments, "CETES").map(
        (investment) => investment.id,
      ),
    ).toEqual(["cetes"])

    expect(
      getSearchedInvestments(resolvedInvestments, "emergencia").map(
        (investment) => investment.id,
      ),
    ).toEqual(["cetes"])
  })

  it("matches case, accents, partial text, and repeated whitespace", () => {
    expect(
      getSearchedInvestments(
        resolvedInvestments,
        "  VACACIONES   MEXICO  ",
      ).map((investment) => investment.id),
    ).toEqual(["klar-2"])
  })

  it("preserves source order and returns no investments for an unmatched query", () => {
    const result = getSearchedInvestments(resolvedInvestments, "does not exist")

    expect(result).toEqual([])
    expect(resolvedInvestments.map((investment) => investment.id)).toEqual([
      "klar-2",
      "klar",
      "cetes",
    ])
  })
})

const investments: Investment[] = [
  buildOpenEndedInvestment({
    id: "klar-2",
    institutionName: "Klar",
    name: "Klar 2",
    notes: "Vacaciones México",
  }),
  buildOpenEndedInvestment({
    id: "klar",
    institutionName: "Klar",
    name: "Klar",
    notes: "Emergency savings",
  }),
  buildOpenEndedInvestment({
    id: "cetes",
    institutionName: "CETÉS",
    name: "Six month savings",
    notes: "Fondo de emergencia",
  }),
]

const resolvedInvestments = investments.map((investment) =>
  resolveInvestment(investment, asOfDate),
)

function buildOpenEndedInvestment({
  id,
  institutionName,
  name,
  notes,
}: {
  id: string
  institutionName: string
  name: string
  notes: string
}): Investment {
  return {
    id,
    name,
    institutionName,
    notes,
    currency: CURRENCIES.mxn,
    createdAt: "2026-01-01T12:00:00.000Z",
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
        annualRate: 8,
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
