import { describe, expect, it } from "vitest"
import {
  createInitialMorphState,
  isSettledAtTarget,
  morphReducer,
} from "@/app/components/search-morph/search-morph-machine"

const openRequest = { type: "OPEN_REQUESTED" as const }
const closeRequest = { type: "CLOSE_REQUESTED" as const }

describe("global investment search morph machine", () => {
  it("starts settled and does not create a transition for the initial target", () => {
    const state = createInitialMorphState("closed")

    expect(state).toEqual({ stage: "closed" })
    expect(morphReducer(state, closeRequest)).toBe(state)
  })

  it("creates an opening transition when the controlled target changes", () => {
    const state = morphReducer(createInitialMorphState("closed"), openRequest)

    expect(state).toEqual({ stage: "opening" })
    expect(isSettledAtTarget(state, "open")).toBe(false)
  })

  it("reverses a transition by entering the new transition stage", () => {
    const openingState = morphReducer(
      createInitialMorphState("closed"),
      openRequest,
    )
    const closingState = morphReducer(openingState, closeRequest)

    expect(closingState).toEqual({ stage: "closing" })
  })

  it("ignores a completion from an obsolete transition", () => {
    const openingState = morphReducer(
      createInitialMorphState("closed"),
      openRequest,
    )
    const closingState = morphReducer(openingState, closeRequest)

    expect(
      morphReducer(closingState, {
        step: "opening",
        type: "TRANSITION_STEP_COMPLETED",
      }),
    ).toBe(closingState)
  })

  it("settles only when the current transition completes", () => {
    const openingState = morphReducer(
      createInitialMorphState("closed"),
      openRequest,
    )
    const openState = morphReducer(openingState, {
      step: "opening",
      type: "TRANSITION_STEP_COMPLETED",
    })

    expect(openState).toEqual({ stage: "open" })
    expect(isSettledAtTarget(openState, "open")).toBe(true)
  })

  it("settles an active transition when the visual sequence is fast-forwarded", () => {
    const openingState = morphReducer(
      createInitialMorphState("closed"),
      openRequest,
    )
    const openState = morphReducer(openingState, {
      step: "opening",
      type: "TRANSITION_SEQUENCE_FAST_FORWARDED",
    })

    expect(openState).toEqual({ stage: "open" })
    expect(isSettledAtTarget(openState, "open")).toBe(true)

    expect(morphReducer(openState, openRequest)).toBe(openState)
  })
})
