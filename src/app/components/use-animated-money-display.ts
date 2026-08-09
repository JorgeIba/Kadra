import { useEffect } from "react"
import {
  animate,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "motion/react"

const MONEY_VALUE_TRANSITION = {
  // Motion's JavaScript animation API uses seconds (320 ms = 0.32 s).
  duration: 0.32,
  ease: [0.22, 1, 0.36, 1],
} as const

interface UseAnimatedMoneyDisplayOptions {
  formatVisibleMoney: (moneyValue: number) => string
  isMoneyHidden: boolean
  moneyValue: number
  prefersReducedMotion: boolean
}

/**
 * Owns numeric money interpolation and formatting. While privacy mode is
 * active, it jumps to the latest amount so a later reveal never exposes an
 * intermediate numeric animation.
 */
export function useAnimatedMoneyDisplay({
  formatVisibleMoney,
  isMoneyHidden,
  moneyValue,
  prefersReducedMotion,
}: UseAnimatedMoneyDisplayOptions): MotionValue<string> {
  const animatedMoneyValue = useMotionValue(moneyValue)
  const animatedMoneyDisplay = useTransform(
    animatedMoneyValue,
    (latestMoneyValue) => formatVisibleMoney(latestMoneyValue),
  )

  useEffect(() => {
    if (isMoneyHidden || prefersReducedMotion) {
      animatedMoneyValue.jump(moneyValue)
      return
    }

    const controls = animate(
      animatedMoneyValue,
      moneyValue,
      MONEY_VALUE_TRANSITION,
    )

    return () => {
      controls.stop()
    }
  }, [animatedMoneyValue, isMoneyHidden, moneyValue, prefersReducedMotion])

  return animatedMoneyDisplay
}
