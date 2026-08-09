/**
 * Runs Motion choreography for the expanding choice picker.
 *
 * Given the machine's active stage, this hook owns every Motion-specific
 * concern: imperative content animation, declarative layout recipes,
 * completion reporting, the layout watchdog, and reduced-motion fast-forward.
 * It reports semantic transition outcomes to the controller; it never decides
 * the next picker state or calls parent-owned callbacks.
 */
import { useAnimate, useReducedMotion } from "motion/react"
import { useCallback, useEffect } from "react"
import {
  isPickerTransitionStep,
  type PickerStage,
  type PickerTransitionStep,
} from "@/app/components/expanding-choice-picker-machine"
import {
  isPickerContentAnimationStep,
  isPickerLayoutAnimationStep,
  PICKER_ANIMATION_PROFILES,
  type PickerAnimationSpeed,
} from "@/app/components/expanding-choice-picker-animations"

interface UseExpandingChoicePickerChoreographyOptions {
  animationSpeed: PickerAnimationSpeed
  onTransitionSequenceFastForwarded: (step: PickerTransitionStep) => void
  onTransitionStepCompleted: (step: PickerTransitionStep) => void
  stage: PickerStage
}

/**
 * How does the active picker transition report completion?
 *
 * An imperative content animation resolves, a layout callback normally reports
 * completion with a watchdog fallback, or reduced motion fast-forwards the
 * visual sequence while preserving the machine's normal settlement.
 */
export function useExpandingChoicePickerChoreography({
  animationSpeed,
  onTransitionSequenceFastForwarded,
  onTransitionStepCompleted,
  stage,
}: UseExpandingChoicePickerChoreographyOptions) {
  const prefersReducedMotion = useReducedMotion() ?? false
  const [choiceContentAnimationScope, animateChoiceContent] = useAnimate()
  const animationProfile = PICKER_ANIMATION_PROFILES[animationSpeed]
  const layoutTransitions = prefersReducedMotion
    ? animationProfile.layout.transitions.reducedMotion
    : animationProfile.layout.transitions.standard

  /**
   * Content steps report completion when Motion's imperative animation control
   * resolves. The controller then forwards that semantic completion to the
   * pure machine.
   */
  useEffect(() => {
    const contentStep = stage
    if (prefersReducedMotion || !isPickerContentAnimationStep(contentStep)) {
      return
    }

    let isCancelled = false
    const contentAnimation = animateChoiceContent(
      "[data-choice-content]",
      animationProfile.content.valuesByStep[contentStep],
      animationProfile.content.transition,
    )

    contentAnimation.then(() => {
      if (!isCancelled) {
        onTransitionStepCompleted(contentStep)
      }
    })

    return () => {
      isCancelled = true
    }
  }, [
    animateChoiceContent,
    animationProfile,
    onTransitionStepCompleted,
    prefersReducedMotion,
    stage,
  ])

  /**
   * Layout steps normally report completion through Motion's layout callback.
   * This watchdog is only a fallback if that callback is missed, so the
   * machine cannot remain stuck on a layout step indefinitely.
   */
  useEffect(() => {
    const layoutStep = stage
    if (prefersReducedMotion || !isPickerLayoutAnimationStep(layoutStep)) {
      return
    }

    const watchdogTimeoutId = window.setTimeout(() => {
      onTransitionStepCompleted(layoutStep)
    }, animationProfile.layout.completionWatchdogDelayByStep[layoutStep])

    return () => window.clearTimeout(watchdogTimeoutId)
  }, [animationProfile, onTransitionStepCompleted, prefersReducedMotion, stage])

  /**
   * Reduced-motion steps report completion by fast-forwarding on the next
   * frame; the machine still emits its normal settled output.
   */
  useEffect(() => {
    const transitionStep = stage
    if (!prefersReducedMotion || !isPickerTransitionStep(transitionStep)) {
      return
    }

    const animationFrameId = requestAnimationFrame(() => {
      onTransitionSequenceFastForwarded(transitionStep)
    })

    return () => window.cancelAnimationFrame(animationFrameId)
  }, [onTransitionSequenceFastForwarded, prefersReducedMotion, stage])

  /** Motion calls this when a layout surface reports the captured stage done. */
  const reportLayoutAnimationComplete = useCallback(
    (completedStage: PickerStage) => {
      const layoutStep = completedStage
      if (
        stage !== completedStage ||
        !isPickerLayoutAnimationStep(layoutStep)
      ) {
        return
      }

      onTransitionStepCompleted(layoutStep)
    },
    [onTransitionStepCompleted, stage],
  )

  return {
    choiceContentAnimationScope,
    layoutTransitions,
    reportLayoutAnimationComplete,
  }
}
