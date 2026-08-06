/**
 * Motion recipes for the expanding choice picker.
 *
 * This module describes how each machine transition is animated. It does not
 * run animations, dispatch events, or access the DOM; the React controller
 * owns that orchestration.
 */
import { type Transition } from "motion/react"
import {
  isPickerTransitionStep,
  type PickerStage,
  type PickerTransitionStep,
} from "@/app/components/expanding-choice-picker-machine"

const PICKER_ANIMATION_DURATIONS_IN_SECONDS = {
  choiceContentVisibility: 0.18,
  choiceSurfaceMorph: 0.26,
  deckArrangement: 0.24,
  selectionIndicatorMove: 0.2,
} as const

/** Partitions transition steps by the animation mechanism that owns them. */
const PICKER_CONTENT_ANIMATION_STEPS = [
  "opening-content-hide",
  "opening-content-show",
  "closing-content-hide",
  "closing-content-show",
] as const satisfies readonly PickerTransitionStep[]

export type PickerContentAnimationStep =
  (typeof PICKER_CONTENT_ANIMATION_STEPS)[number]

// Every transition step not listed above is declarative layout choreography.
export type PickerLayoutAnimationStep = Exclude<
  PickerTransitionStep,
  PickerContentAnimationStep
>

const PICKER_CONTENT_ANIMATION_STEP_SET: ReadonlySet<PickerTransitionStep> =
  new Set(PICKER_CONTENT_ANIMATION_STEPS)

export function isPickerContentAnimationStep(
  stage: PickerStage,
): stage is PickerContentAnimationStep {
  return (
    isPickerTransitionStep(stage) &&
    PICKER_CONTENT_ANIMATION_STEP_SET.has(stage)
  )
}

export function isPickerLayoutAnimationStep(
  stage: PickerStage,
): stage is PickerLayoutAnimationStep {
  return isPickerTransitionStep(stage) && !isPickerContentAnimationStep(stage)
}

interface OptionContentAnimationValues {
  clipPath: string
  opacity: number
  scaleX: number
}

interface OptionContentAnimationConfig {
  transition: Transition
  valuesByStep: Record<PickerContentAnimationStep, OptionContentAnimationValues>
}

/**
 * `useAnimate` applies these values to every `[data-choice-content]` element.
 * The horizontal clip and slight compression hide the contents while their
 * surrounding surfaces morph, and opacity prevents clipped edges from ghosting.
 */
const HIDE_OPTION_CONTENT_ANIMATION_VALUES = {
  clipPath: "inset(0 100% 0 0)",
  opacity: 0,
  scaleX: 0.94,
} satisfies OptionContentAnimationValues

const SHOW_OPTION_CONTENT_ANIMATION_VALUES = {
  clipPath: "inset(0 0 0 0)",
  opacity: 1,
  scaleX: 1,
} satisfies OptionContentAnimationValues

/** Imperative option-content animation driven and completed by `useAnimate`. */
export const PICKER_CONTENT_ANIMATION = {
  transition: {
    duration: PICKER_ANIMATION_DURATIONS_IN_SECONDS.choiceContentVisibility,
    ease: [0.22, 1, 0.36, 1],
    type: "tween",
  },
  valuesByStep: {
    "opening-content-hide": HIDE_OPTION_CONTENT_ANIMATION_VALUES,
    "opening-content-show": SHOW_OPTION_CONTENT_ANIMATION_VALUES,
    "closing-content-hide": HIDE_OPTION_CONTENT_ANIMATION_VALUES,
    "closing-content-show": SHOW_OPTION_CONTENT_ANIMATION_VALUES,
  },
} satisfies OptionContentAnimationConfig

/** Motion transitions consumed by the deck, option surfaces, and indicator. */
export interface PickerLayoutTransitions {
  choiceSurfaceMorph: Transition
  deckArrangement: Transition
  selectionIndicatorMove: Transition
}

interface PickerLayoutAnimationConfig {
  transitions: {
    reducedMotion: PickerLayoutTransitions
    standard: PickerLayoutTransitions
  }
  completionWatchdogDelayByStep: Record<PickerLayoutAnimationStep, number>
}

// Deck changes move both the grid and its choices; the watchdog uses the slower duration.
const LONGEST_DECK_LAYOUT_TRANSITION_DURATION_SECONDS = Math.max(
  PICKER_ANIMATION_DURATIONS_IN_SECONDS.deckArrangement,
  PICKER_ANIMATION_DURATIONS_IN_SECONDS.choiceSurfaceMorph,
)
const LAYOUT_COMPLETION_WATCHDOG_MARGIN_MS = 20

function getLayoutCompletionWatchdogDelayMs(animationDurationSeconds: number) {
  return animationDurationSeconds * 1_000 + LAYOUT_COMPLETION_WATCHDOG_MARGIN_MS
}

// Layout still renders while reduced-motion settlement is pending, so it must be instant.
const REDUCED_MOTION_TRANSITION = { duration: 0 } satisfies Transition

/**
 * Declarative layout recipes and their completion policy. Motion's callback
 * normally completes each step; watchdog delays only prevent a stalled machine.
 */
export const PICKER_LAYOUT_ANIMATION = {
  transitions: {
    reducedMotion: {
      choiceSurfaceMorph: REDUCED_MOTION_TRANSITION,
      deckArrangement: REDUCED_MOTION_TRANSITION,
      selectionIndicatorMove: REDUCED_MOTION_TRANSITION,
    },
    standard: {
      choiceSurfaceMorph: {
        bounce: 0.02,
        duration: PICKER_ANIMATION_DURATIONS_IN_SECONDS.choiceSurfaceMorph,
        type: "spring",
      },
      deckArrangement: {
        bounce: 0.02,
        duration: PICKER_ANIMATION_DURATIONS_IN_SECONDS.deckArrangement,
        type: "spring",
      },
      selectionIndicatorMove: {
        bounce: 0.02,
        duration: PICKER_ANIMATION_DURATIONS_IN_SECONDS.selectionIndicatorMove,
        type: "spring",
      },
    },
  },
  completionWatchdogDelayByStep: {
    "opening-row-to-card": getLayoutCompletionWatchdogDelayMs(
      PICKER_ANIMATION_DURATIONS_IN_SECONDS.choiceSurfaceMorph,
    ),
    "opening-deck-expand": getLayoutCompletionWatchdogDelayMs(
      LONGEST_DECK_LAYOUT_TRANSITION_DURATION_SECONDS,
    ),
    "moving-selection": getLayoutCompletionWatchdogDelayMs(
      PICKER_ANIMATION_DURATIONS_IN_SECONDS.selectionIndicatorMove,
    ),
    "closing-deck-stack": getLayoutCompletionWatchdogDelayMs(
      LONGEST_DECK_LAYOUT_TRANSITION_DURATION_SECONDS,
    ),
    "closing-card-to-row": getLayoutCompletionWatchdogDelayMs(
      PICKER_ANIMATION_DURATIONS_IN_SECONDS.choiceSurfaceMorph,
    ),
  },
} satisfies PickerLayoutAnimationConfig
