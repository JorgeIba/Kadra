/**
 * Pure state machine for the search morph.
 *
 * It owns the semantic stage and accepts completion reports from the visual
 * layer. React, Motion, DOM measurement, and reduced-motion policy belong to
 * the controller and choreography layers.
 */
export type MorphTarget = "closed" | "open"

export type MorphTransitionStep = "opening" | "closing"
export type MorphStage = MorphTarget | MorphTransitionStep

export interface MorphState {
  stage: MorphStage
}

export type MorphEvent =
  | { type: "OPEN_REQUESTED" }
  | { type: "CLOSE_REQUESTED" }
  | {
      type: "TRANSITION_STEP_COMPLETED"
      step: MorphTransitionStep
    }
  | {
      type: "TRANSITION_SEQUENCE_FAST_FORWARDED"
      step: MorphTransitionStep
    }

export function createInitialMorphState(target: MorphTarget): MorphState {
  return { stage: target }
}

export function isMorphTransitionStep(
  stage: MorphStage,
): stage is MorphTransitionStep {
  return stage === "opening" || stage === "closing"
}

export function morphReducer(state: MorphState, event: MorphEvent): MorphState {
  switch (event.type) {
    case "OPEN_REQUESTED": {
      if (state.stage === "open" || state.stage === "opening") {
        return state
      }

      return { stage: "opening" }
    }
    case "CLOSE_REQUESTED": {
      if (state.stage === "closed" || state.stage === "closing") {
        return state
      }

      return { stage: "closing" }
    }
    case "TRANSITION_STEP_COMPLETED":
    case "TRANSITION_SEQUENCE_FAST_FORWARDED": {
      if (state.stage !== event.step) {
        return state
      }

      return {
        stage: event.step === "opening" ? "open" : "closed",
      }
    }
  }
}

export function isSettledAtTarget(
  state: MorphState,
  target: MorphTarget,
): boolean {
  return state.stage === target
}
