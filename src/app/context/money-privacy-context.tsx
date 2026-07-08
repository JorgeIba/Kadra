import { createContext, useContext } from "react"

export interface MoneyPrivacyContextValue {
  formatMoney: (value: number) => string
  isMoneyHidden: boolean
  toggleMoneyVisibility: () => void
}

export const MoneyPrivacyContext =
  createContext<MoneyPrivacyContextValue | null>(null)

export function useMoneyPrivacy() {
  const context = useContext(MoneyPrivacyContext)

  if (context === null) {
    throw new Error("useMoneyPrivacy must be used within MoneyPrivacyProvider")
  }

  return context
}

export function useMoneyFormatter() {
  return useMoneyPrivacy().formatMoney
}
