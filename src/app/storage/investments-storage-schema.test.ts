import { describe, expect, it } from "vitest"
import {
  CURRENCIES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
  type Investment,
} from "@/domain/investments"
import { parseStoredInvestments } from "@/app/storage/investments-storage-schema"

const validInvestments: Investment[] = [
  {
    createdAt: "2026-05-20T12:00:00.000Z",
    currency: CURRENCIES.mxn,
    id: "fixed-investment",
    institutionName: "CETES Directo",
    name: "CETES 6 months",
    updatedAt: "2026-06-15T09:00:00.000Z",
    contributions: [
      {
        id: "contribution-1",
        amount: 10_000,
        contributionDate: "2026-05-20",
        createdAt: "2026-05-20T12:00:00.000Z",
      },
      {
        id: "contribution-2",
        amount: 2_500,
        contributionDate: "2026-06-01",
        createdAt: "2026-06-01T10:30:00.000Z",
      },
    ],
    ratePeriods: [
      {
        id: "rate-period-1",
        annualRate: 10,
        startDate: "2026-05-20",
        endDate: "2026-06-15",
        createdAt: "2026-05-20T12:00:00.000Z",
      },
      {
        id: "rate-period-2",
        annualRate: 9.75,
        startDate: "2026-06-15",
        createdAt: "2026-06-15T09:00:00.000Z",
      },
    ],
    lifecyclePeriods: [
      {
        id: "lifecycle-period-1",
        type: "fixed-term",
        paymentFrequency: PAYMENT_FREQUENCIES.monthly,
        reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
        startDate: "2026-05-20",
        endDate: "2026-12-31",
        createdAt: "2026-05-20T12:00:00.000Z",
      },
    ],
  },
  {
    createdAt: "2026-05-03T12:10:00.000Z",
    currency: CURRENCIES.mxn,
    id: "flex-investment",
    institutionName: "Klar",
    name: "Klar flexible",
    notes: "Open-ended account that later entered a promo term.",
    updatedAt: "2026-07-10T08:00:00.000Z",
    contributions: [
      {
        id: "contribution-1",
        amount: 25_000,
        contributionDate: "2026-05-03",
        createdAt: "2026-05-03T12:10:00.000Z",
      },
      {
        id: "contribution-2",
        amount: 5_000,
        contributionDate: "2026-05-20",
        createdAt: "2026-05-20T10:00:00.000Z",
      },
    ],
    ratePeriods: [
      {
        id: "rate-period-1",
        annualRate: 12,
        startDate: "2026-05-03",
        endDate: "2026-06-10",
        createdAt: "2026-05-03T12:10:00.000Z",
      },
      {
        id: "rate-period-2",
        annualRate: 11.4,
        startDate: "2026-06-10",
        endDate: "2026-07-10",
        createdAt: "2026-06-10T08:45:00.000Z",
      },
      {
        id: "rate-period-3",
        annualRate: 10.8,
        startDate: "2026-07-10",
        createdAt: "2026-07-10T08:00:00.000Z",
      },
    ],
    lifecyclePeriods: [
      {
        id: "lifecycle-period-1",
        type: "open-ended",
        paymentFrequency: PAYMENT_FREQUENCIES.daily,
        reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
        startDate: "2026-05-03",
        createdAt: "2026-05-03T12:10:00.000Z",
      },
      {
        id: "lifecycle-period-2",
        type: "fixed-term",
        paymentFrequency: PAYMENT_FREQUENCIES.atMaturity,
        reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
        startDate: "2026-06-10",
        endDate: "2026-07-10",
        createdAt: "2026-06-10T08:45:00.000Z",
      },
      {
        id: "lifecycle-period-3",
        type: "open-ended",
        paymentFrequency: PAYMENT_FREQUENCIES.daily,
        reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
        startDate: "2026-07-10",
        createdAt: "2026-07-10T08:00:00.000Z",
      },
    ],
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
          contributions: [
            {
              ...validInvestments[0].contributions[0],
              amount: -1,
            },
          ],
        },
      ]),
    ).toBeNull()
  })

  it("rejects investments without contribution history", () => {
    expect(
      parseStoredInvestments([
        {
          ...validInvestments[0],
          contributions: [],
        },
      ]),
    ).toBeNull()
  })

  it("rejects investments without rate history", () => {
    expect(
      parseStoredInvestments([
        {
          ...validInvestments[0],
          ratePeriods: [],
        },
      ]),
    ).toBeNull()
  })

  it("rejects investments without lifecycle history", () => {
    expect(
      parseStoredInvestments([
        {
          ...validInvestments[0],
          lifecyclePeriods: [],
        },
      ]),
    ).toBeNull()
  })

  it("rejects invalid calendar date strings inside nested history", () => {
    expect(
      parseStoredInvestments([
        {
          ...validInvestments[0],
          ratePeriods: [
            {
              ...validInvestments[0].ratePeriods[0],
              startDate: "2026-02-30",
            },
          ],
        },
      ]),
    ).toBeNull()
  })

  it("rejects invalid timestamps inside nested history", () => {
    expect(
      parseStoredInvestments([
        {
          ...validInvestments[0],
          contributions: [
            {
              ...validInvestments[0].contributions[0],
              createdAt: "not-a-real-timestamp",
            },
          ],
        },
      ]),
    ).toBeNull()
  })

  it("rejects open-ended investments with an end date", () => {
    expect(
      parseStoredInvestments([
        {
          ...validInvestments[0],
          lifecyclePeriods: [
            {
              ...validInvestments[0].lifecyclePeriods[0],
              type: "open-ended",
              endDate: "2026-12-31",
            },
          ],
        },
      ]),
    ).toBeNull()
  })

  it("rejects fixed-term lifecycle periods without an end date", () => {
    expect(
      parseStoredInvestments([
        {
          ...validInvestments[0],
          lifecyclePeriods: [
            {
              id: "lifecycle-period-1",
              type: "fixed-term",
              paymentFrequency: PAYMENT_FREQUENCIES.monthly,
              reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
              startDate: "2026-05-20",
              createdAt: "2026-05-20T12:00:00.000Z",
            },
          ],
        },
      ]),
    ).toBeNull()
  })

  it("rejects extra fields instead of silently over-parsing", () => {
    expect(
      parseStoredInvestments([
        {
          ...validInvestments[0],
          debugLabel: "should-not-be-persisted",
        },
      ]),
    ).toBeNull()
  })

  it("rejects extra nested fields instead of silently over-parsing", () => {
    expect(
      parseStoredInvestments([
        {
          ...validInvestments[0],
          ratePeriods: [
            {
              ...validInvestments[0].ratePeriods[0],
              teaserRate: 99,
            },
          ],
        },
      ]),
    ).toBeNull()
  })
})
