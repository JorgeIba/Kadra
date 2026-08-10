import { describe, expect, it } from "vitest"
import {
  CURRENCIES,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
  resolveInvestment,
  type Investment,
} from "@/domain/investments"
import {
  getAssetSuggestionsMatchingQuery,
  getInvestmentsMatchingQuery,
} from "@/app/screens/assets/assets-search"

const asOfDate = new Date("2026-06-05T12:00:00.000Z")

describe("asset search", () => {
  it("returns all investments for an empty query without reusing the source array", () => {
    const result = getInvestmentsMatchingQuery(resolvedInvestments, "  ")

    expect(result).toEqual(resolvedInvestments)
    expect(result).not.toBe(resolvedInvestments)
  })

  it("matches investment names, institutions, and notes", () => {
    expect(
      getInvestmentsMatchingQuery(resolvedInvestments, "Klar").map(
        (investment) => investment.id,
      ),
    ).toEqual(["klar-2", "klar"])

    expect(
      getInvestmentsMatchingQuery(resolvedInvestments, "CETES").map(
        (investment) => investment.id,
      ),
    ).toEqual(["cetes"])

    expect(
      getInvestmentsMatchingQuery(resolvedInvestments, "emergencia").map(
        (investment) => investment.id,
      ),
    ).toEqual(["cetes"])
  })

  it("matches case, accents, partial text, and repeated whitespace", () => {
    expect(
      getInvestmentsMatchingQuery(
        resolvedInvestments,
        "  VACACIONES   MEXICO  ",
      ).map((investment) => investment.id),
    ).toEqual(["klar-2"])
  })

  it("preserves source order and returns no investments for an unmatched query", () => {
    const result = getInvestmentsMatchingQuery(
      resolvedInvestments,
      "does not exist",
    )

    expect(result).toEqual([])
    expect(resolvedInvestments.map((investment) => investment.id)).toEqual([
      "klar-2",
      "klar",
      "cetes",
    ])
  })

  it("returns suggestions for one character but not empty queries", () => {
    expect(getAssetSuggestionsMatchingQuery(investments, "K")).toEqual([
      "Klar",
      "Klar 2",
    ])
    expect(getAssetSuggestionsMatchingQuery(investments, "  K ")).toEqual([
      "Klar",
      "Klar 2",
    ])
    expect(getAssetSuggestionsMatchingQuery(investments, "")).toEqual([])
    expect(getAssetSuggestionsMatchingQuery(investments, "   ")).toEqual([])
  })

  it("suggests names and institutions with normalized, case-insensitive deduplication", () => {
    expect(getAssetSuggestionsMatchingQuery(investments, "Klar")).toEqual([
      "Klar",
      "Klar 2",
    ])

    expect(getAssetSuggestionsMatchingQuery(investments, "CETES")).toEqual([
      "CETÉS",
    ])
  })

  it("does not suggest values found only in notes", () => {
    expect(getAssetSuggestionsMatchingQuery(investments, "emergencia")).toEqual(
      [],
    )
  })

  it("limits suggestions to six deterministic results", () => {
    const manyInvestments = Array.from({ length: 8 }, (_, index) =>
      buildOpenEndedInvestment({
        id: `provider-${index}`,
        institutionName: `Provider ${index}`,
        name: `Asset ${index}`,
        notes: "",
      }),
    )

    expect(
      getAssetSuggestionsMatchingQuery(manyInvestments, "provider"),
    ).toEqual([
      "Provider 0",
      "Provider 1",
      "Provider 2",
      "Provider 3",
      "Provider 4",
      "Provider 5",
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
    institutionName: "klar",
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
