import { describe, expect, it } from "vitest"
import { readMoneyPrivacyState } from "@/app/storage/money-privacy-storage"

describe("MoneyPrivacyProvider", () => {
  it("migrates the legacy privacy preference into the Kadra storage namespace", () => {
    const storage = createMemoryStorage({
      "trafin.moneyPrivacyHidden": "true",
    })

    expect(readMoneyPrivacyState(storage)).toBe(true)
    expect(storage.getItem("kadra.moneyPrivacyHidden")).toBe("true")
    expect(storage.getItem("trafin.moneyPrivacyHidden")).toBeNull()
  })

  it("keeps the legacy privacy preference when migration persistence fails", () => {
    const storage = {
      getItem(key: string) {
        return key === "trafin.moneyPrivacyHidden" ? "true" : null
      },
      removeItem: () => undefined,
      setItem: () => {
        throw new Error("storage quota exceeded")
      },
    }

    expect(readMoneyPrivacyState(storage)).toBe(true)
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
