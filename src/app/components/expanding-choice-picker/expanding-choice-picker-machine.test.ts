import { describe, expect, it } from "vitest"
import {
  canRequestOpen,
  createInitialPickerState,
  isPickerCloseSettlementPending,
  pickerReducer,
  type PickerState,
  type PickerTransitionStep,
} from "@/app/components/expanding-choice-picker/expanding-choice-picker-machine"

const OPENING_STEPS = [
  "opening-content-hide",
  "opening-row-to-card",
  "opening-content-show",
  "opening-deck-expand",
] as const satisfies readonly PickerTransitionStep[]

const CLOSING_STEPS = [
  "moving-selection",
  "closing-deck-stack",
  "closing-content-hide",
  "closing-card-to-row",
  "closing-content-show",
] as const satisfies readonly PickerTransitionStep[]

function completeSteps(
  state: PickerState,
  steps: readonly PickerTransitionStep[],
) {
  return steps.reduce((currentState, step) => {
    return pickerReducer(currentState, {
      step,
      type: "TRANSITION_STEP_COMPLETED",
    })
  }, state)
}

function createSettledExpandedState() {
  let state = createInitialPickerState()
  state = pickerReducer(state, { type: "OPEN_REQUESTED" })
  state = pickerReducer(state, {
    sequence: 1,
    type: "OUTPUT_ACKNOWLEDGED",
  })
  state = pickerReducer(state, { type: "OPEN_AUTHORIZED" })
  state = completeSteps(state, OPENING_STEPS)

  return pickerReducer(state, {
    sequence: 2,
    type: "OUTPUT_ACKNOWLEDGED",
  })
}

describe("expanding choice picker machine", () => {
  it("waits for explicit authorization after emitting one opening request", () => {
    const initialState = createInitialPickerState()
    expect(canRequestOpen(initialState)).toBe(true)

    const waitingState = pickerReducer(initialState, {
      type: "OPEN_REQUESTED",
    })

    expect(canRequestOpen(waitingState)).toBe(false)

    expect(waitingState).toMatchObject({
      nextOutputSequence: 2,
      output: { sequence: 1, type: "opening-requested" },
      stage: "awaiting-open-readiness",
    })
    expect(pickerReducer(waitingState, { type: "OPEN_REQUESTED" })).toBe(
      waitingState,
    )
    expect(
      pickerReducer(waitingState, { type: "OPEN_AUTHORIZED" }),
    ).toMatchObject({
      stage: "opening-content-hide",
    })
  })

  it("consumes authorization only for an opening that is already waiting", () => {
    const collapsedState = createInitialPickerState()

    expect(pickerReducer(collapsedState, { type: "OPEN_AUTHORIZED" })).toBe(
      collapsedState,
    )
  })

  it("walks the complete opening choreography and emits an opened output", () => {
    let state = createInitialPickerState()
    state = pickerReducer(state, { type: "OPEN_REQUESTED" })
    state = pickerReducer(state, {
      sequence: 1,
      type: "OUTPUT_ACKNOWLEDGED",
    })
    state = pickerReducer(state, { type: "OPEN_AUTHORIZED" })

    state = completeSteps(state, OPENING_STEPS)

    expect(state).toMatchObject({
      output: { sequence: 2, type: "opened" },
      stage: "expanded",
    })
  })

  it("walks the changed-value closing choreography and emits a closed output", () => {
    let state = createSettledExpandedState()
    state = pickerReducer(state, {
      didValueChange: true,
      type: "OPTION_CHOSEN",
    })

    state = completeSteps(state, CLOSING_STEPS)

    expect(state).toMatchObject({
      output: { sequence: 3, type: "closed" },
      stage: "collapsed",
    })
  })

  it("closes without moving the selection when the value is unchanged", () => {
    let state = createSettledExpandedState()
    state = pickerReducer(state, {
      didValueChange: false,
      type: "OPTION_CHOSEN",
    })

    expect(state.stage).toBe("closing-deck-stack")
    state = completeSteps(state, CLOSING_STEPS.slice(1))

    expect(state).toMatchObject({
      output: { sequence: 3, type: "closed" },
      stage: "collapsed",
    })
  })

  it("ignores completion events for a different or already completed step", () => {
    let state = pickerReducer(createInitialPickerState(), {
      type: "OPEN_REQUESTED",
    })
    state = pickerReducer(state, {
      sequence: 1,
      type: "OUTPUT_ACKNOWLEDGED",
    })
    state = pickerReducer(state, { type: "OPEN_AUTHORIZED" })

    expect(
      pickerReducer(state, {
        step: "opening-row-to-card",
        type: "TRANSITION_STEP_COMPLETED",
      }),
    ).toBe(state)

    state = pickerReducer(state, {
      step: "opening-content-hide",
      type: "TRANSITION_STEP_COMPLETED",
    })

    expect(
      pickerReducer(state, {
        step: "opening-content-hide",
        type: "TRANSITION_STEP_COMPLETED",
      }),
    ).toBe(state)
  })

  it("ignores acknowledgements for an output other than the pending one", () => {
    const state = pickerReducer(createInitialPickerState(), {
      type: "OPEN_REQUESTED",
    })

    expect(
      pickerReducer(state, {
        sequence: 2,
        type: "OUTPUT_ACKNOWLEDGED",
      }),
    ).toBe(state)
    expect(state.output).toMatchObject({
      sequence: 1,
      type: "opening-requested",
    })
  })

  it("does not accept another opening until the previous close is acknowledged", () => {
    let state = createInitialPickerState()
    state = pickerReducer(state, { type: "OPEN_REQUESTED" })
    state = pickerReducer(state, {
      sequence: 1,
      type: "OUTPUT_ACKNOWLEDGED",
    })
    state = pickerReducer(state, { type: "OPEN_AUTHORIZED" })

    state = pickerReducer(state, {
      step: "opening-content-hide",
      type: "TRANSITION_SEQUENCE_FAST_FORWARDED",
    })
    state = pickerReducer(state, {
      sequence: 2,
      type: "OUTPUT_ACKNOWLEDGED",
    })
    state = pickerReducer(state, {
      didValueChange: true,
      type: "OPTION_CHOSEN",
    })
    state = pickerReducer(state, {
      step: "moving-selection",
      type: "TRANSITION_SEQUENCE_FAST_FORWARDED",
    })

    const closePendingState = state

    expect(closePendingState).toMatchObject({
      output: { sequence: 3, type: "closed" },
      stage: "collapsed",
    })
    expect(canRequestOpen(closePendingState)).toBe(false)
    expect(isPickerCloseSettlementPending(closePendingState)).toBe(true)
    expect(pickerReducer(closePendingState, { type: "OPEN_REQUESTED" })).toBe(
      closePendingState,
    )

    const settledState = pickerReducer(closePendingState, {
      sequence: 3,
      type: "OUTPUT_ACKNOWLEDGED",
    })

    expect(canRequestOpen(settledState)).toBe(true)
    expect(isPickerCloseSettlementPending(settledState)).toBe(false)

    expect(
      pickerReducer(settledState, { type: "OPEN_REQUESTED" }),
    ).toMatchObject({
      stage: "awaiting-open-readiness",
    })
  })

  it("moves selection only when the controlled value will change", () => {
    const expandedState = {
      ...createInitialPickerState(),
      stage: "expanded" as const,
    }

    expect(
      pickerReducer(expandedState, {
        didValueChange: true,
        type: "OPTION_CHOSEN",
      }),
    ).toMatchObject({ stage: "moving-selection" })
    expect(
      pickerReducer(expandedState, {
        didValueChange: false,
        type: "OPTION_CHOSEN",
      }),
    ).toMatchObject({ stage: "closing-deck-stack" })
  })
})
