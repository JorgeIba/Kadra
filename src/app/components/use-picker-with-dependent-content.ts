import { useReducer } from "react"

type PickerWithDependentContentPhase =
  | "settled"
  | "dependent-content-exiting"
  | "picker-interaction-active"

type PickerWithDependentContentEvent =
  | {
      hasVisibleDependentContent: boolean
      type: "PICKER_OPEN_REQUESTED"
    }
  | { type: "DEPENDENT_CONTENT_EXIT_COMPLETED" }
  | { type: "PICKER_CLOSE_COMPLETED" }

interface PickerWithDependentContentState {
  phase: PickerWithDependentContentPhase
}

interface UsePickerWithDependentContentOptions {
  /** Whether the caller is currently rendering content that must exit first. */
  hasVisibleDependentContent: boolean
}

/**
 * Coordinates a picker with dependent sibling content. It owns only the
 * sequencing boundary: visible content exits before the picker may open, and
 * returns once the completed picker interaction has closed.
 *
 * The picker itself owns its temporary selection; the caller owns its
 * committed value and the dependent content derived from that value.
 */
export function usePickerWithDependentContent({
  hasVisibleDependentContent,
}: UsePickerWithDependentContentOptions) {
  const [state, dispatch] = useReducer(pickerWithDependentContentReducer, {
    phase: "settled",
  })
  const isInteractionSettled = state.phase === "settled"

  function onPickerOpenRequest() {
    dispatch({
      hasVisibleDependentContent,
      type: "PICKER_OPEN_REQUESTED",
    })
  }

  function onDependentContentExitComplete() {
    dispatch({ type: "DEPENDENT_CONTENT_EXIT_COMPLETED" })
  }

  function onPickerCloseComplete() {
    dispatch({ type: "PICKER_CLOSE_COMPLETED" })
  }

  return {
    canStartPendingPickerOpening: state.phase === "picker-interaction-active",
    onDependentContentExitComplete,
    onPickerCloseComplete,
    onPickerOpenRequest,
    shouldRenderDependentContent:
      isInteractionSettled && hasVisibleDependentContent,
  }
}

/**
 * Keeps only the generic timing rule: dependent content exits before a picker
 * opens and is allowed to return after that picker closes.
 */
function pickerWithDependentContentReducer(
  state: PickerWithDependentContentState,
  event: PickerWithDependentContentEvent,
): PickerWithDependentContentState {
  switch (event.type) {
    case "PICKER_OPEN_REQUESTED":
      if (state.phase !== "settled") {
        return state
      }

      return {
        phase: event.hasVisibleDependentContent
          ? "dependent-content-exiting"
          : "picker-interaction-active",
      }
    case "DEPENDENT_CONTENT_EXIT_COMPLETED":
      return state.phase === "dependent-content-exiting"
        ? { ...state, phase: "picker-interaction-active" }
        : state
    case "PICKER_CLOSE_COMPLETED":
      return state.phase === "picker-interaction-active"
        ? { ...state, phase: "settled" }
        : state
  }
}
