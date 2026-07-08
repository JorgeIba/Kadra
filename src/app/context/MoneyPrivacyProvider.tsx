import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  MoneyPrivacyContext,
  type MoneyPrivacyContextValue,
} from "@/app/context/money-privacy-context"
import { formatMxn } from "@/lib/formatters"

const MONEY_PRIVACY_STORAGE_KEY = "trafin.moneyPrivacyHidden"
const HIDDEN_MONEY_MASK = "$••••••"

export function MoneyPrivacyProvider({ children }: { children: ReactNode }) {
  const [isMoneyHidden, setIsMoneyHidden] = useState(readInitialPrivacyState)

  useEffect(() => {
    window.localStorage.setItem(
      MONEY_PRIVACY_STORAGE_KEY,
      isMoneyHidden ? "true" : "false",
    )
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

function readInitialPrivacyState() {
  return window.localStorage.getItem(MONEY_PRIVACY_STORAGE_KEY) === "true"
}
