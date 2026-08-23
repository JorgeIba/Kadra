import { motion, useReducedMotion } from "motion/react"
import { useTranslation } from "react-i18next"
import { useMoneyPrivacy } from "@/app/context/money-privacy-context"
import { formatHiddenMoney, formatMxn } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import { useAnimatedMoneyDisplay } from "./use-animated-money-display"
import { useMoneyPrivacyAnimation } from "./use-money-privacy-animation"

interface MoneyAmountProps {
  className?: string
  value: number
}

export function MoneyAmount({ className, value }: MoneyAmountProps) {
  const { t } = useTranslation()
  const prefersReducedMotion = useReducedMotion() ?? false
  const { isMoneyHidden } = useMoneyPrivacy()
  const animatedMoneyDisplay = useAnimatedMoneyDisplay({
    formatVisibleMoney: formatMxn,
    isMoneyHidden,
    moneyValue: value,
    prefersReducedMotion,
  })
  const privacyAnimation = useMoneyPrivacyAnimation({
    isMoneyHidden,
    prefersReducedMotion,
  })
  const privacyState = isMoneyHidden ? "hidden" : "visible"

  return (
    <span className={cn("money-amount", className)} data-privacy={privacyState}>
      <motion.span
        aria-hidden="true"
        className="money-amount-value money-amount-hidden-value"
        style={{ clipPath: privacyAnimation.hiddenValueClipPath }}
      >
        {formatHiddenMoney(value)}
      </motion.span>
      <motion.span
        aria-hidden={isMoneyHidden}
        className="money-amount-value money-amount-visible-value"
        style={{
          clipPath: privacyAnimation.visibleValueClipPath,
          filter: privacyAnimation.visibleValueFilter,
        }}
      >
        {animatedMoneyDisplay}
      </motion.span>
      <motion.span
        aria-hidden="true"
        className="money-privacy-veil"
        style={{
          opacity: privacyAnimation.veilOpacity,
          scaleX: privacyAnimation.veilScaleX,
          width: `${privacyAnimation.veilWidthPercent}%`,
          x: privacyAnimation.veilX,
        }}
      />
      {isMoneyHidden ? (
        <span className="sr-only">
          {t("common.accessibility.amountHidden")}
        </span>
      ) : null}
    </span>
  )
}
