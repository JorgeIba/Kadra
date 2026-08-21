/**
 * Runs the search morph's Motion choreography boundary.
 *
 * This is the Motion boundary. It focuses on Motion's reduced-motion
 * preference, visual completion, and translating animation outcomes into
 * semantic callbacks for the controller.
 */
import { useReducedMotion } from "motion/react"
import { useCallback, useEffect } from "react"
import {
  isMorphTransitionStep,
  type MorphStage,
  type MorphTransitionStep,
} from "@/app/components/search-morph-machine"

interface UseSearchMorphChoreographyOptions {
  onTransitionSequenceFastForwarded: (step: MorphTransitionStep) => void
  onTransitionStepCompleted: (step: MorphTransitionStep) => void
  reducedMotion?: boolean
  stage?: MorphStage
}

export function useSearchMorphChoreography({
  onTransitionSequenceFastForwarded,
  onTransitionStepCompleted,
  reducedMotion,
  stage,
}: UseSearchMorphChoreographyOptions) {
  const systemPrefersReducedMotion = useReducedMotion() ?? false
  const prefersReducedMotion = reducedMotion ?? systemPrefersReducedMotion

  /**
   * Motion reports the stage captured by the rendered visual tree. The hook
   * rejects it if the machine has already moved to another stage.
   */
  const reportTransitionStepComplete = useCallback(
    (completedStage: MorphStage) => {
      if (stage !== completedStage || !isMorphTransitionStep(completedStage)) {
        return
      }

      onTransitionStepCompleted(completedStage)
    },
    [onTransitionStepCompleted, stage],
  )

  useEffect(() => {
    if (
      !prefersReducedMotion ||
      stage === undefined ||
      !isMorphTransitionStep(stage)
    ) {
      return
    }

    const animationFrameId = requestAnimationFrame(() => {
      onTransitionSequenceFastForwarded(stage)
    })

    return () => window.cancelAnimationFrame(animationFrameId)
  }, [onTransitionSequenceFastForwarded, prefersReducedMotion, stage])

  return { reportTransitionStepComplete }
}
