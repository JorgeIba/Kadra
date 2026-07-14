import { describe, expect, it } from "vitest"
import {
  CURRENCIES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
  type Investment,
} from "@/domain/investments"
import {
  clearInvestmentsFromStorage,
  loadInvestmentsFromStorage,
  saveInvestmentsToStorage,
} from "@/app/storage/investments-storage"

const fallbackInvestments: Investment[] = [
  {
    createdAt: "2026-05-20T12:00:00.000Z",
    currency: CURRENCIES.mxn,
    id: "fallback-investment",
    institutionName: "Fallback institution",
    name: "Fallback investment",
    updatedAt: "2026-06-10T08:00:00.000Z",
    contributionEvents: [
      {
        id: "contribution-event-1",
        amount: 1_000,
        effectiveDate: "2026-05-20",
        createdAt: "2026-05-20T12:00:00.000Z",
        kind: "contribution",
      },
      {
        id: "contribution-event-2",
        amount: 500,
        effectiveDate: "2026-06-01",
        createdAt: "2026-06-01T08:30:00.000Z",
        kind: "contribution",
      },
    ],
    rateEvents: [
      {
        id: "rate-event-1",
        annualRate: 9,
        effectiveDate: "2026-05-20",
        createdAt: "2026-05-20T12:00:00.000Z",
      },
      {
        id: "rate-event-2",
        annualRate: 8.8,
        effectiveDate: "2026-06-10",
        createdAt: "2026-06-10T08:00:00.000Z",
      },
    ],
    lifecycleEvents: [
      {
        id: "lifecycle-event-1",
        type: "fixed-term",
        paymentFrequency: PAYMENT_FREQUENCIES.monthly,
        reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
        effectiveDate: "2026-05-20",
        maturityDate: "2026-12-31",
        createdAt: "2026-05-20T12:00:00.000Z",
      },
    ],
  },
]

const storedInvestments: Investment[] = [
  {
    createdAt: "2026-05-20T13:00:00.000Z",
    currency: CURRENCIES.mxn,
    id: "stored-investment",
    institutionName: "Stored institution",
    name: "Stored investment",
    updatedAt: "2026-07-10T09:00:00.000Z",
    contributionEvents: [
      {
        id: "contribution-event-1",
        amount: 2_000,
        effectiveDate: "2026-05-20",
        createdAt: "2026-05-20T13:00:00.000Z",
        kind: "contribution",
      },
      {
        id: "contribution-event-2",
        amount: 750,
        effectiveDate: "2026-06-15",
        createdAt: "2026-06-15T10:00:00.000Z",
        kind: "contribution",
      },
    ],
    rateEvents: [
      {
        id: "rate-event-1",
        annualRate: 11,
        effectiveDate: "2026-05-20",
        createdAt: "2026-05-20T13:00:00.000Z",
      },
      {
        id: "rate-event-2",
        annualRate: 10.5,
        effectiveDate: "2026-07-10",
        createdAt: "2026-07-10T09:00:00.000Z",
      },
    ],
    lifecycleEvents: [
      {
        id: "lifecycle-event-1",
        type: "open-ended",
        paymentFrequency: PAYMENT_FREQUENCIES.weekly,
        reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
        effectiveDate: "2026-05-20",
        createdAt: "2026-05-20T13:00:00.000Z",
      },
      {
        id: "lifecycle-event-2",
        type: "fixed-term",
        paymentFrequency: PAYMENT_FREQUENCIES.atMaturity,
        reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
        effectiveDate: "2026-07-10",
        maturityDate: "2026-08-10",
        createdAt: "2026-07-10T09:00:00.000Z",
      },
    ],
  },
]

describe("investments storage", () => {
  it("loads fallback investments when browser storage is unavailable", () => {
    expect(loadInvestmentsFromStorage(fallbackInvestments, null)).toBe(
      fallbackInvestments,
    )
  })

  it("loads fallback investments when no investments are stored", () => {
    const storage = createMemoryStorage()

    expect(loadInvestmentsFromStorage(fallbackInvestments, storage)).toBe(
      fallbackInvestments,
    )
  })

  it("saves and loads stored investments", () => {
    const storage = createMemoryStorage()

    expect(saveInvestmentsToStorage(storedInvestments, storage)).toBe(true)
    expect(loadInvestmentsFromStorage(fallbackInvestments, storage)).toEqual(
      storedInvestments,
    )
  })

  it("migrates legacy investments into the Kadra storage namespace", () => {
    const storage = createMemoryStorage({
      "trafin.investments.v1": JSON.stringify(storedInvestments),
    })

    expect(loadInvestmentsFromStorage(fallbackInvestments, storage)).toEqual(
      storedInvestments,
    )
    expect(storage.getItem("kadra.investments.v1")).toBe(
      JSON.stringify(storedInvestments),
    )
    expect(storage.getItem("trafin.investments.v1")).toBeNull()
  })

  it("keeps legacy investments available when migration persistence fails", () => {
    const legacyInvestments = JSON.stringify(storedInvestments)
    const storage = {
      getItem(key: string) {
        return key === "trafin.investments.v1" ? legacyInvestments : null
      },
      removeItem: () => undefined,
      setItem: () => {
        throw new Error("storage quota exceeded")
      },
    }

    expect(loadInvestmentsFromStorage(fallbackInvestments, storage)).toEqual(
      storedInvestments,
    )
  })

  it("prefers Kadra investments when both storage namespaces exist", () => {
    const storage = createMemoryStorage({
      "kadra.investments.v1": JSON.stringify(storedInvestments),
      "trafin.investments.v1": JSON.stringify(fallbackInvestments),
    })

    expect(loadInvestmentsFromStorage(fallbackInvestments, storage)).toEqual(
      storedInvestments,
    )
    expect(storage.getItem("trafin.investments.v1")).toBe(
      JSON.stringify(fallbackInvestments),
    )
  })

  it("loads fallback investments when stored JSON is malformed", () => {
    const storage = createMemoryStorage({
      "kadra.investments.v1": "{not-valid-json",
    })

    expect(loadInvestmentsFromStorage(fallbackInvestments, storage)).toBe(
      fallbackInvestments,
    )
  })

  it("loads fallback investments when stored investments are invalid", () => {
    const storage = createMemoryStorage({
      "kadra.investments.v1": JSON.stringify([
        {
          ...storedInvestments[0],
          contributionEvents: [
            {
              ...storedInvestments[0].contributionEvents[0],
              amount: -1,
            },
          ],
        },
      ]),
    })

    expect(loadInvestmentsFromStorage(fallbackInvestments, storage)).toBe(
      fallbackInvestments,
    )
  })

  it("reports failed saves without throwing", () => {
    const storage = {
      getItem: () => null,
      removeItem: () => undefined,
      setItem: () => {
        throw new Error("storage unavailable")
      },
    }

    expect(saveInvestmentsToStorage(storedInvestments, storage)).toBe(false)
  })

  it("clears stored investments", () => {
    const storage = createMemoryStorage()

    saveInvestmentsToStorage(storedInvestments, storage)

    expect(clearInvestmentsFromStorage(storage)).toBe(true)
    expect(loadInvestmentsFromStorage(fallbackInvestments, storage)).toBe(
      fallbackInvestments,
    )
  })

  it("clears current and legacy investment storage", () => {
    const storage = createMemoryStorage({
      "kadra.investments.v1": JSON.stringify(storedInvestments),
      "trafin.investments.v1": JSON.stringify(fallbackInvestments),
    })

    expect(clearInvestmentsFromStorage(storage)).toBe(true)
    expect(storage.getItem("kadra.investments.v1")).toBeNull()
    expect(storage.getItem("trafin.investments.v1")).toBeNull()
  })

  it("reports failed clears without throwing", () => {
    const storage = {
      getItem: () => null,
      removeItem: () => {
        throw new Error("storage unavailable")
      },
      setItem: () => undefined,
    }

    expect(clearInvestmentsFromStorage(storage)).toBe(false)
  })
})

function createMemoryStorage(initialValues: Record<string, string> = {}) {
  const values = { ...initialValues }

  return {
    getItem(key: string) {
      return values[key] ?? null
    },
    removeItem(key: string) {
      delete values[key]
    },
    setItem(key: string, value: string) {
      values[key] = value
    },
  }
}
