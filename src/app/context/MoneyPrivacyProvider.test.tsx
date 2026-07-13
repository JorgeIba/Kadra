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
