import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  MoneyPrivacyContext,
  type MoneyPrivacyContextValue,
} from "@/app/context/money-privacy-context"
import {
  readMoneyPrivacyState,
  saveMoneyPrivacyState,
} from "@/app/storage/money-privacy-storage"
import { formatMxn } from "@/lib/formatters"

const HIDDEN_MONEY_MASK = "$••••••"

export function MoneyPrivacyProvider({ children }: { children: ReactNode }) {
  const [isMoneyHidden, setIsMoneyHidden] = useState(readMoneyPrivacyState)

  useEffect(() => {
    saveMoneyPrivacyState(isMoneyHidden)
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
