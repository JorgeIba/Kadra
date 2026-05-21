import { describe, expect, it } from "vitest"
import {
  CURRENCIES,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
  type Investment,
} from "@/domain/investments"
import { parseStoredInvestments } from "@/app/storage/investments-storage-schema"

const validInvestments: Investment[] = [
  {
    annualRate: 10,
    createdAt: "2026-05-20T12:00:00.000Z",
    currency: CURRENCIES.mxn,
    endDate: "2026-12-31",
    id: "fixed-investment",
    institutionName: "CETES Directo",
    name: "CETES 6 months",
    originalAmount: 10_000,
    paymentFrequency: PAYMENT_FREQUENCIES.monthly,
    reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
    startDate: "2026-05-20",
    type: INVESTMENT_TYPES.fixedTerm,
    updatedAt: "2026-05-20T12:00:00.000Z",
  },
]

describe("investments storage schema", () => {
  it("parses valid stored investments", () => {
    expect(parseStoredInvestments(validInvestments)).toEqual(validInvestments)
  })

  it("rejects non-array values", () => {
    expect(parseStoredInvestments({ investments: validInvestments })).toBeNull()
  })

  it("rejects invalid investment values", () => {
    expect(
      parseStoredInvestments([
        {
          ...validInvestments[0],
          originalAmount: -1,
        },
      ]),
    ).toBeNull()
  })

  it("rejects open-ended investments with an end date", () => {
    expect(
      parseStoredInvestments([
        {
          ...validInvestments[0],
          endDate: "2026-12-31",
          type: INVESTMENT_TYPES.openEnded,
        },
      ]),
    ).toBeNull()
  })
})
