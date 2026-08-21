/**
 * React adapter for the pure morph machine.
 *
 * This is the React-to-machine boundary. It focuses on controlled props,
 * dispatching semantic machine events, and exposing state and callbacks to the
 * visual layers. React state wiring lives here.
 */
import { useCallback, useLayoutEffect, useReducer } from "react"
import {
  createInitialMorphState,
  isSettledAtTarget,
  morphReducer,
  type MorphTransitionStep,
} from "@/app/components/search-morph-machine"

interface UseSearchMorphControllerOptions {
  isOpen: boolean
}

export function useSearchMorphController({
  isOpen,
}: UseSearchMorphControllerOptions) {
  const [morphState, dispatch] = useReducer(
    morphReducer,
    isOpen ? "open" : "closed",
    createInitialMorphState,
  )

  /** Reconciles the parent's controlled target before the browser paints. */
  useLayoutEffect(() => {
    dispatch({ type: isOpen ? "OPEN_REQUESTED" : "CLOSE_REQUESTED" })
  }, [isOpen])

  const completeTransitionStep = useCallback((step: MorphTransitionStep) => {
    dispatch({
      step,
      type: "TRANSITION_STEP_COMPLETED",
    })
  }, [])

  const fastForwardTransitionSequence = useCallback(
    (step: MorphTransitionStep) => {
      dispatch({
        step,
        type: "TRANSITION_SEQUENCE_FAST_FORWARDED",
      })
    },
    [],
  )

  return {
    completeTransitionStep,
    fastForwardTransitionSequence,
    isContentVisible: isSettledAtTarget(morphState, "open"),
    isTriggerExpanded: isOpen,
    stage: morphState.stage,
  }
}
