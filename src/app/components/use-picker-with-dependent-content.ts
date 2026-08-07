import { useReducer } from "react"

type PickerWithDependentContentPhase =
  | "settled"
  | "dependent-content-exiting"
  | "picker-interaction-active"

type PickerWithDependentContentEvent<T> =
  | {
      committedValue: T
      hasVisibleDependentContent: boolean
      type: "PICKER_OPEN_REQUESTED"
    }
  | { type: "DEPENDENT_CONTENT_EXIT_COMPLETED" }
  | { type: "PICKER_VALUE_CHANGED"; value: T }
  | { type: "PICKER_CLOSE_COMPLETED" }

interface PickerWithDependentContentState<T> {
  pickerSelection: T
  phase: PickerWithDependentContentPhase
}

interface UsePickerWithDependentContentOptions<T> {
  /** The authoritative value owned and committed by the caller. */
  committedValue: T
  /** Whether the caller is currently rendering content that must exit first. */
  hasVisibleDependentContent: boolean
}

/**
 * Coordinates an externally controlled picker with dependent sibling content.
 * Visible content exits before opening; the picker previews its selection
 * locally until the caller commits a completed interaction.
 */
export function usePickerWithDependentContent<T>({
  committedValue,
  hasVisibleDependentContent,
}: UsePickerWithDependentContentOptions<T>) {
  const [state, dispatch] = useReducer(pickerWithDependentContentReducer<T>, {
    pickerSelection: committedValue,
    phase: "settled",
  })
  const isInteractionSettled = state.phase === "settled"

  function onPickerOpenRequest() {
    dispatch({
      committedValue,
      hasVisibleDependentContent,
      type: "PICKER_OPEN_REQUESTED",
    })
  }

  function onDependentContentExitComplete() {
    dispatch({ type: "DEPENDENT_CONTENT_EXIT_COMPLETED" })
  }

  function onPickerValueChange(value: T) {
    dispatch({ type: "PICKER_VALUE_CHANGED", value })
  }

  function onPickerCloseComplete() {
    dispatch({ type: "PICKER_CLOSE_COMPLETED" })
  }

  return {
    canStartPendingPickerOpening: state.phase === "picker-interaction-active",
    onDependentContentExitComplete,
    onPickerCloseComplete,
    onPickerOpenRequest,
    onPickerValueChange,
    pickerValue: isInteractionSettled ? committedValue : state.pickerSelection,
    shouldRenderDependentContent:
      isInteractionSettled && hasVisibleDependentContent,
  }
}

/**
 * Keeps only the generic timing rule: dependent content exits before a picker
 * opens, and a temporary choice remains visible until that picker closes.
 */
function pickerWithDependentContentReducer<T>(
  state: PickerWithDependentContentState<T>,
  event: PickerWithDependentContentEvent<T>,
): PickerWithDependentContentState<T> {
  switch (event.type) {
    case "PICKER_OPEN_REQUESTED":
      if (state.phase !== "settled") {
        return state
      }

      return {
        pickerSelection: event.committedValue,
        phase: event.hasVisibleDependentContent
          ? "dependent-content-exiting"
          : "picker-interaction-active",
      }
    case "DEPENDENT_CONTENT_EXIT_COMPLETED":
      return state.phase === "dependent-content-exiting"
        ? { ...state, phase: "picker-interaction-active" }
        : state
    case "PICKER_VALUE_CHANGED":
      return state.phase === "picker-interaction-active"
        ? { ...state, pickerSelection: event.value }
        : state
    case "PICKER_CLOSE_COMPLETED":
      return state.phase === "picker-interaction-active"
        ? { ...state, phase: "settled" }
        : state
  }
}
