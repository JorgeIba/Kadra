import { useEffect, useMemo } from "react"
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react"
import { useMoneyPrivacy } from "@/app/context/money-privacy-context"
import { cn } from "@/lib/utils"

interface MoneyAmountProps {
  className?: string
  value: number
}

const MONEY_VALUE_TRANSITION = {
  // Motion's JavaScript animation API uses seconds (320 ms = 0.32 s).
  duration: 0.32,
  ease: [0.22, 1, 0.36, 1],
} as const

/**
 * The MotionValue owns numeric interpolation while the surrounding Motion
 * span owns privacy transitions. Keeping those concerns separate prevents a
 * privacy reveal from restarting a money transition.
 */
export function MoneyAmount({ className, value }: MoneyAmountProps) {
  const prefersReducedMotion = useReducedMotion() ?? false
  const { formatMoney, isMoneyHidden } = useMoneyPrivacy()
  const animatedValue = useMotionValue(value)
  const animatedDisplayValue = useTransform(animatedValue, (latestValue) =>
    formatMoney(latestValue),
  )
  const privacyState = isMoneyHidden ? "hidden" : "visible"
  const privacyAnimation = useMemo(
    () =>
      getMoneyPrivacyAnimation({
        isMoneyHidden,
        prefersReducedMotion,
      }),
    [isMoneyHidden, prefersReducedMotion],
  )

  useEffect(() => {
    if (isMoneyHidden || prefersReducedMotion) {
      animatedValue.jump(value)
      return
    }

    const controls = animate(animatedValue, value, MONEY_VALUE_TRANSITION)
    return () => {
      controls.stop()
    }
  }, [animatedValue, formatMoney, isMoneyHidden, prefersReducedMotion, value])

  return (
    <span className={cn("money-amount", className)} data-privacy={privacyState}>
      <motion.span
        aria-hidden={isMoneyHidden}
        animate={privacyAnimation}
        initial={false}
        className="money-amount-value"
        transition={{
          duration: isMoneyHidden ? 0.2 : 0.24,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {isMoneyHidden ? formatMoney(value) : animatedDisplayValue}
      </motion.span>
      {isMoneyHidden ? <span className="sr-only">Amount hidden</span> : null}
    </span>
  )
}

function getMoneyPrivacyAnimation({
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
