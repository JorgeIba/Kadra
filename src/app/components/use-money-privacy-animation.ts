import { useEffect } from "react"
import {
  animate,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "motion/react"

const MONEY_PRIVACY_PROGRESS_TRANSITION = {
  duration: 0.5,
  ease: [0.4, 0, 0.2, 1],
} as const

// These progress points keep the scan visible while it crosses the amount.
const MONEY_PRIVACY_SCAN_PROGRESS = [0, 0.18, 0.62, 1]

/**
 * The same progress value drives both the text clip and the scan. That keeps
 * the veil at the boundary where real digits are being revealed or redacted.
 */
const MONEY_PRIVACY_SCAN_OPACITY = [0, 0.52, 0.52, 0]
const MONEY_PRIVACY_SCAN_SCALE_X = [0.72, 1, 1, 0.72]
const MONEY_PRIVACY_HIDDEN_CLIP_PATH = ["inset(0 0 0 0%)", "inset(0 100% 0 0%)"]
const MONEY_PRIVACY_VISIBLE_CLIP_PATH = ["inset(0 0 0 100%)", "inset(0 0 0 0%)"]
const MONEY_PRIVACY_VISIBLE_FILTER = ["blur(3.5px)", "blur(0px)"]
const MONEY_PRIVACY_VEIL_WIDTH_PERCENT = 55
const MONEY_PRIVACY_VEIL_HALF_WIDTH_PERCENT =
  MONEY_PRIVACY_VEIL_WIDTH_PERCENT / 2

export interface MoneyPrivacyAnimation {
  hiddenValueClipPath: MotionValue<string>
  veilOpacity: MotionValue<number>
  veilScaleX: MotionValue<number>
  veilWidthPercent: number
  veilX: MotionValue<string>
  visibleValueClipPath: MotionValue<string>
  visibleValueFilter: MotionValue<string>
}

interface UseMoneyPrivacyAnimationOptions {
  isMoneyHidden: boolean
  prefersReducedMotion: boolean
}

/**
 * Owns the hide/reveal choreography. It returns MotionValues for the shared
 * MoneyAmount shell instead of rendering anything, so the masked text, real
 * text, and veil can remain aligned in one grid cell.
 */
export function useMoneyPrivacyAnimation({
  isMoneyHidden,
  prefersReducedMotion,
}: UseMoneyPrivacyAnimationOptions): MoneyPrivacyAnimation {
  // Source of truth for the animation. 0 = hidden, 1 = visible. The other MotionValues
  // are derived from this one.
  const revealProgress = useMotionValue(isMoneyHidden ? 0 : 1)

  const visibleValueClipPath = useTransform(
    revealProgress,
    [0, 1],
    MONEY_PRIVACY_VISIBLE_CLIP_PATH,
  )
  const hiddenValueClipPath = useTransform(
    revealProgress,
    [0, 1],
    MONEY_PRIVACY_HIDDEN_CLIP_PATH,
  )
  const visibleValueFilter = useTransform(
    revealProgress,
    [0, 1],
    MONEY_PRIVACY_VISIBLE_FILTER,
  )
  const veilOpacity = useTransform(
    revealProgress,
    MONEY_PRIVACY_SCAN_PROGRESS,
    MONEY_PRIVACY_SCAN_OPACITY,
  )
  const veilScaleX = useTransform(
    revealProgress,
    MONEY_PRIVACY_SCAN_PROGRESS,
    MONEY_PRIVACY_SCAN_SCALE_X,
  )
  const veilX = useTransform(revealProgress, (progress) => {
    // Center the veil on the boundary between masked and real characters.
    const boundaryPercent = (1 - progress) * 100
    const veilLeftPercent =
      boundaryPercent - MONEY_PRIVACY_VEIL_HALF_WIDTH_PERCENT

    return `${(veilLeftPercent / MONEY_PRIVACY_VEIL_WIDTH_PERCENT) * 100}%`
  })

  useEffect(() => {
    const targetRevealProgress = isMoneyHidden ? 0 : 1

    if (prefersReducedMotion) {
      revealProgress.jump(targetRevealProgress)
      return
    }

    const controls = animate(
      revealProgress,
      targetRevealProgress,
      MONEY_PRIVACY_PROGRESS_TRANSITION,
    )

    return () => {
      controls.stop()
    }
  }, [isMoneyHidden, prefersReducedMotion, revealProgress])

  return {
    hiddenValueClipPath,
    veilOpacity,
    veilScaleX,
    veilWidthPercent: MONEY_PRIVACY_VEIL_WIDTH_PERCENT,
    veilX,
    visibleValueClipPath,
    visibleValueFilter,
  }
}
