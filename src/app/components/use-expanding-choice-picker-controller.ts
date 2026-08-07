/**
 * React adapter for the expanding choice picker feature session.
 *
 * The pure machine chooses the active stage. This hook turns parent props and
 * user actions into machine events, delivers machine outputs as React effects,
 * and delegates every Motion concern to the choreography driver.
 */
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useReducer,
  useRef,
  useState,
} from "react"
import {
  canRequestOpen,
  createInitialPickerState,
  isPickerCloseSettlementPending,
  pickerReducer,
  type PickerTransitionStep,
} from "@/app/components/expanding-choice-picker-machine"
import { useExpandingChoicePickerChoreography } from "@/app/components/use-expanding-choice-picker-choreography"

interface UseExpandingChoicePickerControllerOptions<T extends string> {
  /**
   * When provided, this only releases an opening request already waiting for
   * external readiness; it does not decide whether a collapsed picker accepts
   * a new request.
   */
  canStartPendingOpening?: boolean
  onCloseComplete?: () => void
  onOpenRequest?: () => void
  onValueChange?: (value: T) => void
  onValueCommit?: (value: T) => void
  value: T
}

export function useExpandingChoicePickerController<T extends string>({
  canStartPendingOpening,
  onCloseComplete,
  onOpenRequest,
  onValueChange,
  onValueCommit,
  value,
}: UseExpandingChoicePickerControllerOptions<T>) {
  const [state, dispatch] = useReducer(
    pickerReducer,
    createInitialPickerState(),
  )
  // The sequence distinguishes repeated one-shot outputs until acknowledged.
  const lastHandledOutputSequenceRef = useRef(0)
  // The caller owns `value`; this controller owns the choice being previewed
  // until the picker has visually settled and may commit it to the caller.
  const [displayedSelection, setDisplayedSelection] = useState<T>(value)
  const valueAtOpenRef = useRef(value)
  const canStartOpeningSession = canRequestOpen(state)
  const isCloseSettlementPending = isPickerCloseSettlementPending(state)
  // Keep the picker’s temporary choice through close-output delivery so the
  // collapsed row cannot briefly revert before the parent commits it.
  const shouldUseDisplayedSelection =
    state.stage !== "collapsed" || state.output !== null
  const displayedValue = shouldUseDisplayedSelection
    ? displayedSelection
    : value

  const completeTransitionStep = useCallback(
    (step: PickerTransitionStep) => {
      dispatch({ step, type: "TRANSITION_STEP_COMPLETED" })
    },
    [dispatch],
  )

  const fastForwardTransitionSequence = useCallback(
    (step: PickerTransitionStep) => {
      dispatch({ step, type: "TRANSITION_SEQUENCE_FAST_FORWARDED" })
    },
    [dispatch],
  )

  const choreography = useExpandingChoicePickerChoreography({
    onTransitionSequenceFastForwarded: fastForwardTransitionSequence,
    onTransitionStepCompleted: completeTransitionStep,
    stage: state.stage,
  })

  /**
   * Keep output delivery in separate Effect Events because each boundary has
   * different work and timing. `closed` waits one frame before exposing parent
   * changes so the collapsed picker can paint before an outcome mounts.
   */
  const handleOpeningRequestedOutput = useEffectEvent((sequence: number) => {
    lastHandledOutputSequenceRef.current = sequence
    onOpenRequest?.()
    dispatch({
      sequence,
      type: "OUTPUT_ACKNOWLEDGED",
    })
  })

  const handlePickerOpenedOutput = useEffectEvent((sequence: number) => {
    lastHandledOutputSequenceRef.current = sequence

    dispatch({
      sequence,
      type: "OUTPUT_ACKNOWLEDGED",
    })
  })

  const handlePickerClosedOutput = useEffectEvent((sequence: number) => {
    lastHandledOutputSequenceRef.current = sequence

    if (displayedSelection !== valueAtOpenRef.current) {
      onValueCommit?.(displayedSelection)
    }
    onCloseComplete?.()

    dispatch({
      sequence,
      type: "OUTPUT_ACKNOWLEDGED",
    })
  })

  /**
   * A requested opening remains visually collapsed until the parent grants
   * permission. Ungated picker instances authorize themselves immediately.
   */
  useEffect(() => {
    if (
      state.stage !== "awaiting-open-readiness" ||
      !(canStartPendingOpening ?? true)
    ) {
      return
    }

    dispatch({ type: "OPEN_AUTHORIZED" })
  }, [canStartPendingOpening, state.stage])

  /**
   * Delivers each one-shot machine output, then acknowledges its exact
   * sequence so it cannot replay on a later render.
   */
  useEffect(() => {
    const output = state.output
    if (
      output === null ||
      output.sequence <= lastHandledOutputSequenceRef.current
    ) {
      return
    }

    if (output.type === "opening-requested") {
      handleOpeningRequestedOutput(output.sequence)
      return
    }

    if (output.type === "opened") {
      handlePickerOpenedOutput(output.sequence)
      return
    }

    const animationFrameId = requestAnimationFrame(() => {
      handlePickerClosedOutput(output.sequence)
    })

    return () => window.cancelAnimationFrame(animationFrameId)
  }, [state.output])

  /** Requests a new opening session only after the previous one is settled. */
  function requestOpen() {
    if (!canStartOpeningSession) {
      return
    }

    valueAtOpenRef.current = value
    setDisplayedSelection(value)
    dispatch({ type: "OPEN_REQUESTED" })
  }

  function chooseOption(chosenValue: T) {
    if (state.stage !== "expanded") {
      return
    }

    const didValueChange = chosenValue !== valueAtOpenRef.current
    setDisplayedSelection(chosenValue)

    if (didValueChange) {
      onValueChange?.(chosenValue)
    }

    dispatch({
      didValueChange,
      type: "OPTION_CHOSEN",
    })
  }

  return {
    choreography,
    chooseOption,
    displayedValue,
    isCloseSettlementPending,
    requestOpen,
    stage: state.stage,
  }
}
