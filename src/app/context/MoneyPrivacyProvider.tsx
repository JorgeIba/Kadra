import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  MoneyPrivacyContext,
  type MoneyPrivacyContextValue,
} from "@/app/context/money-privacy-context"
import { formatMxn } from "@/lib/formatters"

const MONEY_PRIVACY_STORAGE_KEY = "trafin.moneyPrivacyHidden"
const HIDDEN_MONEY_MASK = "$••••••"

type MoneyPrivacyStorage = Pick<Storage, "getItem" | "setItem">

export function MoneyPrivacyProvider({ children }: { children: ReactNode }) {
  const [isMoneyHidden, setIsMoneyHidden] = useState(readInitialPrivacyState)

  useEffect(() => {
    savePrivacyState(isMoneyHidden)
  }, [isMoneyHidden])

  const value = useMemo<MoneyPrivacyContextValue>(
    () => ({
      formatMoney(value) {
        if (!isMoneyHidden) {
          return formatMxn(value)
        }

        return value < 0 ? `-${HIDDEN_MONEY_MASK}` : HIDDEN_MONEY_MASK
      },
      isMoneyHidden,
      toggleMoneyVisibility() {
        setIsMoneyHidden((currentValue) => !currentValue)
      },
    }),
    [isMoneyHidden],
  )

  return (
    <MoneyPrivacyContext.Provider value={value}>
      {children}
    </MoneyPrivacyContext.Provider>
  )
}

function readInitialPrivacyState(storage = getBrowserStorage()) {
  if (storage === null) {
    return false
  }

  try {
    return storage.getItem(MONEY_PRIVACY_STORAGE_KEY) === "true"
  } catch {
    return false
  }
}

function savePrivacyState(
  isMoneyHidden: boolean,
  storage = getBrowserStorage(),
) {
  if (storage === null) {
    return
  }

  try {
    storage.setItem(MONEY_PRIVACY_STORAGE_KEY, isMoneyHidden ? "true" : "false")
  } catch {
    // Privacy mode still works for the current session if persistence fails.
  }
}

function getBrowserStorage(): MoneyPrivacyStorage | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}
