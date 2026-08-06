/** The complete picker vocabulary, grouped by each stage's role. */
const PICKER_STAGE_GROUPS = {
  resting: ["collapsed", "expanded"],
  // Remains visually collapsed but blocks input until opening may begin.
  waiting: ["awaiting-open-readiness"],
  opening: [
    "opening-content-hide",
    "opening-row-to-card",
    "opening-content-show",
    "opening-deck-expand",
  ],
  closing: [
    "moving-selection",
    "closing-deck-stack",
    "closing-content-hide",
    "closing-card-to-row",
    "closing-content-show",
  ],
} as const

type PickerRestingStage = (typeof PICKER_STAGE_GROUPS.resting)[number]
type PickerWaitingStage = (typeof PICKER_STAGE_GROUPS.waiting)[number]
type PickerOpeningStep = (typeof PICKER_STAGE_GROUPS.opening)[number]
type PickerClosingStep = (typeof PICKER_STAGE_GROUPS.closing)[number]
export type PickerTransitionStep = PickerOpeningStep | PickerClosingStep

export type PickerStage =
  | PickerRestingStage
  | PickerWaitingStage
  | PickerTransitionStep

const PICKER_TRANSITION_STEP_SET: ReadonlySet<PickerStage> =
  new Set<PickerStage>([
    ...PICKER_STAGE_GROUPS.opening,
    ...PICKER_STAGE_GROUPS.closing,
  ])

type PickerStageResult =
  | { next: PickerTransitionStep; type: "advance" }
  | { next: PickerRestingStage; type: "settle" }

const PICKER_STAGE_RESULTS = {
  "opening-content-hide": {
    next: "opening-row-to-card",
    type: "advance",
  },
  "opening-row-to-card": {
    next: "opening-content-show",
    type: "advance",
  },
  "opening-content-show": {
    next: "opening-deck-expand",
    type: "advance",
  },
  "opening-deck-expand": {
    next: "expanded",
    type: "settle",
  },
  "moving-selection": {
    next: "closing-deck-stack",
    type: "advance",
  },
  "closing-deck-stack": {
    next: "closing-content-hide",
    type: "advance",
  },
  "closing-content-hide": {
    next: "closing-card-to-row",
    type: "advance",
  },
  "closing-card-to-row": {
    next: "closing-content-show",
    type: "advance",
  },
  "closing-content-show": {
    next: "collapsed",
    type: "settle",
  },
} satisfies Record<PickerTransitionStep, PickerStageResult>

/** Fast-forward path: bypass choreography but preserve settlement outputs. */
const PICKER_FAST_FORWARD_SETTLEMENT_BY_STEP = {
  "opening-content-hide": "expanded",
  "opening-row-to-card": "expanded",
  "opening-content-show": "expanded",
  "opening-deck-expand": "expanded",
  "moving-selection": "collapsed",
  "closing-deck-stack": "collapsed",
  "closing-content-hide": "collapsed",
  "closing-card-to-row": "collapsed",
  "closing-content-show": "collapsed",
} satisfies Record<PickerTransitionStep, PickerRestingStage>

export function isPickerTransitionStep(
  stage: PickerStage,
): stage is PickerTransitionStep {
  return PICKER_TRANSITION_STEP_SET.has(stage)
}

/** Semantic outcomes emitted by the pure machine and interpreted by React. */
type PickerOutput =
  | { sequence: number; type: "opening-requested" }
  | { sequence: number; type: "opened" }
  | { sequence: number; type: "closed" }

/**
 * One-shot message for the React adapter. Option values stay outside this
 * choreography-only machine. Some events are blocked until it is acknowledged.
 */
export interface PickerState {
  nextOutputSequence: number
  output: PickerOutput | null
  stage: PickerStage
}

export type PickerEvent =
  | { type: "OPEN_REQUESTED" }
  | { type: "OPEN_AUTHORIZED" }
  | { type: "OPTION_CHOSEN"; didValueChange: boolean }
  | { type: "TRANSITION_STEP_COMPLETED"; step: PickerTransitionStep }
  | {
      type: "TRANSITION_SEQUENCE_FAST_FORWARDED"
      step: PickerTransitionStep
    }
  | { type: "OUTPUT_ACKNOWLEDGED"; sequence: number }

export function createInitialPickerState(): PickerState {
  return {
    nextOutputSequence: 1,
    output: null,
    stage: "collapsed",
  }
}

/**
 * Internal eligibility for a new opening request. External authorization is a
 * separate concern: it only releases a request that is already waiting.
 */
export function canRequestOpen(state: PickerState): boolean {
  return state.stage === "collapsed" && state.output === null
}

/**
 * A close has reached its resting geometry, but React has not yet delivered
 * its `closed` output to the parent. The picker must not begin a new session.
 */
export function isPickerCloseSettlementPending(state: PickerState): boolean {
  return state.stage === "collapsed" && state.output?.type === "closed"
}

/**
 * Accepts one collapsed activation, locks the picker while React coordinates
 * external readiness, and emits exactly one request for the parent to handle.
 */
function waitForOpeningAuthorization(state: PickerState): PickerState {
  const sequence = state.nextOutputSequence

  return {
    ...state,
    nextOutputSequence: sequence + 1,
    output: { sequence, type: "opening-requested" },
    stage: "awaiting-open-readiness",
  }
}

/**
 * Finishes an opening or closing sequence by entering its stable stage and
 * publishing the one-shot output that React must acknowledge.
 */
function enterRestingStage(
  state: PickerState,
  restingStage: PickerRestingStage,
): PickerState {
  const sequence = state.nextOutputSequence

  if (restingStage === "expanded") {
    return {
      ...state,
      nextOutputSequence: sequence + 1,
      output: { sequence, type: "opened" },
      stage: "expanded",
    }
  }

  // restingStage === "collapsed"
  return {
    ...state,
    nextOutputSequence: sequence + 1,
    output: { sequence, type: "closed" },
    stage: "collapsed",
  }
}

/**
 * Pure event-to-state boundary: rejects events that do not apply to the
 * current stage and returns the next state without performing UI effects.
 */
export function pickerReducer(
  state: PickerState,
  event: PickerEvent,
): PickerState {
  switch (event.type) {
    case "OPEN_REQUESTED": {
      if (!canRequestOpen(state)) {
        return state
      }

      return waitForOpeningAuthorization(state)
    }
    case "OPEN_AUTHORIZED": {
      if (state.stage !== "awaiting-open-readiness") {
        return state
      }

      return { ...state, stage: "opening-content-hide" }
    }
    case "OPTION_CHOSEN": {
      if (state.stage !== "expanded") {
        return state
      }

      return {
        ...state,
        stage: event.didValueChange ? "moving-selection" : "closing-deck-stack",
      }
    }
    case "TRANSITION_STEP_COMPLETED": {
      if (state.stage !== event.step) {
        return state
      }

      const result = PICKER_STAGE_RESULTS[event.step]
      return result.type === "advance"
        ? { ...state, stage: result.next }
        : // settle: enter the next resting stage and emit the corresponding output
          enterRestingStage(state, result.next)
    }
    case "TRANSITION_SEQUENCE_FAST_FORWARDED":
      if (state.stage !== event.step) {
        return state
      }

      return enterRestingStage(
        state,
        PICKER_FAST_FORWARD_SETTLEMENT_BY_STEP[event.step],
      )
    case "OUTPUT_ACKNOWLEDGED": {
      if (state.output?.sequence !== event.sequence) {
        return state
      }

      return { ...state, output: null }
    }
  }
}
