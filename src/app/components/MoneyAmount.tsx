import { motion, useReducedMotion } from "motion/react"
import { useMoneyPrivacy } from "@/app/context/money-privacy-context"
import { cn } from "@/lib/utils"

interface MoneyAmountProps {
  className?: string
  value: number
}

export function MoneyAmount({ className, value }: MoneyAmountProps) {
  const prefersReducedMotion = useReducedMotion() ?? false
  const { formatMoney, isMoneyHidden } = useMoneyPrivacy()
  const displayValue = formatMoney(value)
  const privacyState = isMoneyHidden ? "hidden" : "visible"
  const animation = getMoneyAmountAnimation({
    isMoneyHidden,
    prefersReducedMotion,
  })

  return (
    <span className={cn("money-amount", className)} data-privacy={privacyState}>
      <motion.span
        aria-hidden={isMoneyHidden}
        animate={animation}
        initial={false}
        key={`${privacyState}:${displayValue}`}
        className="money-amount-value"
        transition={{
          duration: isMoneyHidden ? 0.2 : 0.24,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {displayValue}
      </motion.span>
      {isMoneyHidden ? <span className="sr-only">Amount hidden</span> : null}
    </span>
  )
}

function getMoneyAmountAnimation({
  isMoneyHidden,
  prefersReducedMotion,
}: {
  isMoneyHidden: boolean
  prefersReducedMotion: boolean
}) {
  if (prefersReducedMotion) {
    return {
      filter: "blur(0px)",
      opacity: 1,
      scale: 1,
      y: 0,
    }
  }

  if (isMoneyHidden) {
    return {
      filter: ["blur(2.5px)", "blur(0px)"],
      opacity: [0.58, 0.88, 1],
      scale: [0.985, 1],
      y: [2, 0],
    }
  }

  return {
    filter: ["blur(3.5px)", "blur(1px)", "blur(0px)"],
    opacity: [0.35, 0.78, 1],
    scale: [0.985, 1],
    y: [2, 0],
  }
}
