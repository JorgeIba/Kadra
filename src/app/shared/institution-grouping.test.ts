import { describe, expect, it } from "vitest"
import {
  CURRENCIES,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
  type Investment,
} from "@/domain/investments"
import {
  getInstitutionGroup,
  getInstitutionSuggestions,
} from "@/app/shared/institution-grouping"

describe("institution grouping", () => {
  it("dedupes institution suggestions case-insensitively while preserving first display casing", () => {
    expect(
      getInstitutionSuggestions([
        buildInvestment("Klar"),
        buildInvestment(" klar "),
        buildInvestment("CETES Directo"),
      ]),
    ).toEqual(["CETES Directo", "Klar"])
  })

  it("returns an institution group identity with trimmed key and display label", () => {
    expect(getInstitutionGroup(" Klar ")).toEqual({
      key: "Klar",
      label: "Klar",
    })
  })

  it("uses an unknown institution label for blank institution names", () => {
    expect(getInstitutionGroup(" ")).toEqual({
      key: "Unknown institution",
      label: "Unknown institution",
    })
  })
})

function buildInvestment(institutionName: string): Investment {
  return {
    createdAt: "2026-01-01T12:00:00.000Z",
    currency: CURRENCIES.mxn,
    id: crypto.randomUUID(),
    institutionName,
    name: institutionName,
    updatedAt: "2026-01-01T12:00:00.000Z",
    contributionEvents: [
      {
        id: `${institutionName}-contribution-event-1`,
        amount: 10_000,
        effectiveDate: "2026-01-01",
        createdAt: "2026-01-01T12:00:00.000Z",
      },
    ],
    rateEvents: [
      {
        id: `${institutionName}-rate-event-1`,
        annualRate: 8,
        effectiveDate: "2026-01-01",
        createdAt: "2026-01-01T12:00:00.000Z",
      },
    ],
    lifecycleEvents: [
      {
        id: `${institutionName}-lifecycle-event-1`,
        type: INVESTMENT_TYPES.openEnded,
        paymentFrequency: PAYMENT_FREQUENCIES.daily,
        reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
        effectiveDate: "2026-01-01",
        createdAt: "2026-01-01T12:00:00.000Z",
      },
    ],
  }
}
