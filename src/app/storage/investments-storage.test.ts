import { describe, expect, it } from "vitest"
import {
  CURRENCIES,
  INVESTMENT_TYPES,
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
    annualRate: 9,
    createdAt: "2026-05-20T12:00:00.000Z",
    currency: CURRENCIES.mxn,
    endDate: "2026-12-31",
    id: "fallback-investment",
    institutionName: "Fallback institution",
    name: "Fallback investment",
    originalAmount: 1_000,
    paymentFrequency: PAYMENT_FREQUENCIES.monthly,
    reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
    startDate: "2026-05-20",
    type: INVESTMENT_TYPES.fixedTerm,
    updatedAt: "2026-05-20T12:00:00.000Z",
  },
]

const storedInvestments: Investment[] = [
  {
    annualRate: 11,
    createdAt: "2026-05-20T13:00:00.000Z",
    currency: CURRENCIES.mxn,
    id: "stored-investment",
    institutionName: "Stored institution",
    name: "Stored investment",
    originalAmount: 2_000,
    paymentFrequency: PAYMENT_FREQUENCIES.weekly,
    reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
    startDate: "2026-05-20",
    type: INVESTMENT_TYPES.openEnded,
    updatedAt: "2026-05-20T13:00:00.000Z",
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

  it("loads fallback investments when stored JSON is malformed", () => {
    const storage = createMemoryStorage({
      "trafin.investments.v1": "{not-valid-json",
    })

    expect(loadInvestmentsFromStorage(fallbackInvestments, storage)).toBe(
      fallbackInvestments,
    )
  })

  it("loads fallback investments when stored investments are invalid", () => {
    const storage = createMemoryStorage({
      "trafin.investments.v1": JSON.stringify([
        {
          ...storedInvestments[0],
          originalAmount: -1,
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
