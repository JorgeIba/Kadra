import { type Target, type Transition } from "motion/react"

export type GlobalInvestmentSearchLabBarDirection = "left" | "right"

export type GlobalInvestmentSearchLabPhase =
  | "closed"
  | "pressure"
  | "split"
  | "open"

export const GLOBAL_INVESTMENT_SEARCH_LAB_ORB_SIZE = 40
export const GLOBAL_INVESTMENT_SEARCH_LAB_SEARCH_BAR_GAP = 8
export const GLOBAL_INVESTMENT_SEARCH_LAB_SEARCH_BAR_MIN_WIDTH = 80

const SEARCH_BAR_INITIAL_WIDTH = GLOBAL_INVESTMENT_SEARCH_LAB_ORB_SIZE
const SEARCH_BAR_PRESSURE_X = 14
const SEARCH_BAR_PRESSURE_WIDTH = 64
const SEARCH_BAR_SPLIT_WIDTH = GLOBAL_INVESTMENT_SEARCH_LAB_SEARCH_BAR_MIN_WIDTH
const SEARCH_BAR_FINAL_LOCAL_X =
  GLOBAL_INVESTMENT_SEARCH_LAB_ORB_SIZE +
  GLOBAL_INVESTMENT_SEARCH_LAB_SEARCH_BAR_GAP
const SEARCH_BAR_RESISTANCE_OFFSET = 2
const PRESSURE_BAR_SCALE_Y = 1.18

const OPEN_TIMES = [0, 0.08, 0.16, 0.24, 0.34, 0.48, 0.62, 0.8, 1]
const CLOSE_TIMES = [0, 0.1, 0.2, 0.34, 0.48, 0.62, 0.76, 0.9, 1]
const OPEN_DURATION = 1
const CLOSE_DURATION = 0.9
const MOTION_EASING = "easeInOut" as const

type NumericMotionValue = number | number[]
type DimensionMotionValue = string | string[]

interface LocalBarGeometry {
  scaleY: NumericMotionValue
  width: NumericMotionValue
  x: NumericMotionValue
}

interface LocalConnectorGeometry {
  opacity: NumericMotionValue
  scaleY: NumericMotionValue
  width: NumericMotionValue
  x: NumericMotionValue
}

export interface GlobalInvestmentSearchLabMotionDefinition {
  barGeometry: Target
  connectorGeometry: Target
  inputWidth: DimensionMotionValue
  orbMotion: {
    rotate: NumericMotionValue
    scale: NumericMotionValue
    x: NumericMotionValue
    y: NumericMotionValue
  }
  transition: Transition
}

interface CreateGlobalInvestmentSearchLabMotionOptions {
  barDirection: GlobalInvestmentSearchLabBarDirection
  isOpen: boolean
  manualPhase?: GlobalInvestmentSearchLabPhase
  orbLeft: number
  prefersReducedMotion: boolean
  searchBarFinalWidth: number
}

function percentageOfFinalBarWidth(value: number, searchBarFinalWidth: number) {
  return `${(value / searchBarFinalWidth) * 100}%`
}

function positionKeyframes(
  localX: NumericMotionValue,
  width: NumericMotionValue,
  barDirection: GlobalInvestmentSearchLabBarDirection,
  orbLeft: number,
): NumericMotionValue {
  const localXValues = Array.isArray(localX) ? localX : [localX]
  const widthValues = Array.isArray(width) ? width : [width]
  const positionedXValues = localXValues.map((x, index) => {
    const currentWidth = widthValues[index] ?? widthValues[0]

    return barDirection === "right"
      ? orbLeft + x
      : orbLeft + GLOBAL_INVESTMENT_SEARCH_LAB_ORB_SIZE - x - currentWidth
  })

  return Array.isArray(localX) ? positionedXValues : positionedXValues[0]
}

function positionBarGeometry(
  geometry: LocalBarGeometry,
  barDirection: GlobalInvestmentSearchLabBarDirection,
  orbLeft: number,
): Target {
  return {
    ...geometry,
    x: positionKeyframes(geometry.x, geometry.width, barDirection, orbLeft),
  }
}

function positionConnectorGeometry(
  geometry: LocalConnectorGeometry,
  barDirection: GlobalInvestmentSearchLabBarDirection,
  orbLeft: number,
): Target {
  return {
    ...geometry,
    x: positionKeyframes(geometry.x, geometry.width, barDirection, orbLeft),
  }
}

export function createGlobalInvestmentSearchLabMotion({
  barDirection,
  isOpen,
  manualPhase,
  orbLeft,
  prefersReducedMotion,
  searchBarFinalWidth,
}: CreateGlobalInvestmentSearchLabMotionOptions): GlobalInvestmentSearchLabMotionDefinition {
  const isManualPhase = manualPhase !== undefined
  const animationDuration = prefersReducedMotion
    ? 0
    : isOpen
      ? OPEN_DURATION
      : CLOSE_DURATION
  const animationTimes = isOpen ? OPEN_TIMES : CLOSE_TIMES
  const transition = prefersReducedMotion
    ? { duration: 0 }
    : {
        duration: animationDuration,
        ease: MOTION_EASING,
        times: animationTimes,
      }
  const searchBarResistanceWidth = Math.max(
    SEARCH_BAR_SPLIT_WIDTH,
    searchBarFinalWidth - SEARCH_BAR_RESISTANCE_OFFSET,
  )
  const searchBarResistanceX =
    SEARCH_BAR_FINAL_LOCAL_X + SEARCH_BAR_RESISTANCE_OFFSET

  const orbMotion = isManualPhase
    ? {
        scale:
          manualPhase === "pressure" ? 1.2 : manualPhase === "split" ? 1.05 : 1,
        x: 0,
        y: 0,
        rotate: 0,
      }
    : prefersReducedMotion
      ? { scale: 1, x: 0, y: 0, rotate: 0 }
      : isOpen
        ? {
            // The Orb gets dizzy first, then inflates before the expulsion.
            scale: [1, 1.03, 0.98, 1.06, 1.22, 1.12, 1.04, 1.02, 1],
            x: [0, -4, 4, -3.5, 3, 0, 0, 0, 0],
            y: [0, 2.2, -2.4, 1.8, -1.2, 0.4, 0, 0, 0],
            rotate: [0, -6, 6, -4.5, 3, -1, 0, 0, 0],
          }
        : {
            // Closing mirrors the story: resistance, absorption, recovery.
            scale: [1, 1.025, 1.04, 1.08, 1.18, 1.24, 1.12, 1.04, 1],
            x: [0, 2.5, -2.5, 3, -3, 2, -1.5, 0.5, 0],
            y: [0, -1.5, 1.8, -1.6, 1.4, -1, 0.6, -0.2, 0],
            rotate: [0, 3.5, -4, 4.5, -4, 3, -1.8, 0.5, 0],
          }

  const localBarGeometry = isManualPhase
    ? manualPhase === "pressure"
      ? {
          x: SEARCH_BAR_PRESSURE_X,
          width: SEARCH_BAR_PRESSURE_WIDTH,
          scaleY: PRESSURE_BAR_SCALE_Y,
        }
      : manualPhase === "split"
        ? {
            x: SEARCH_BAR_FINAL_LOCAL_X,
            width: SEARCH_BAR_SPLIT_WIDTH,
            scaleY: 1,
          }
        : manualPhase === "open"
          ? {
              x: SEARCH_BAR_FINAL_LOCAL_X,
              width: searchBarFinalWidth,
              scaleY: 1,
            }
          : { x: 0, width: SEARCH_BAR_INITIAL_WIDTH, scaleY: 1 }
    : prefersReducedMotion
      ? isOpen
        ? {
            x: SEARCH_BAR_FINAL_LOCAL_X,
            width: searchBarFinalWidth,
            scaleY: 1,
          }
        : { x: 0, width: SEARCH_BAR_INITIAL_WIDTH, scaleY: 1 }
      : isOpen
        ? {
            // The bar starts inside the Orb, protrudes, then gets expelled.
            x: [
              0,
              0,
              0,
              4,
              SEARCH_BAR_PRESSURE_X,
              30,
              SEARCH_BAR_FINAL_LOCAL_X,
              SEARCH_BAR_FINAL_LOCAL_X,
              SEARCH_BAR_FINAL_LOCAL_X,
            ],
            width: [40, 40, 42, 54, 64, 72, 80, 80, searchBarFinalWidth],
            scaleY: [1, 1.03, 0.99, 1.1, 1.2, 1.08, 0.98, 1, 1],
          }
        : {
            // The bar resists, reconnects, and is finally absorbed.
            x: [
              SEARCH_BAR_FINAL_LOCAL_X,
              searchBarResistanceX,
              SEARCH_BAR_FINAL_LOCAL_X,
              SEARCH_BAR_FINAL_LOCAL_X,
              40,
              26,
              12,
              0,
              0,
            ],
            width: [
              searchBarFinalWidth,
              searchBarResistanceWidth,
              searchBarFinalWidth,
              searchBarFinalWidth,
              72,
              64,
              52,
              40,
              40,
            ],
            scaleY: [1, 0.98, 1.02, 1.05, 1.18, 1.22, 1.1, 1, 1],
          }

  const localConnectorGeometry = isManualPhase
    ? manualPhase === "pressure"
      ? { x: 26, width: 22, scaleY: 1.2, opacity: 1 }
      : manualPhase === "split"
        ? { x: 40, width: 18, scaleY: 0.9, opacity: 0.85 }
        : { x: 52, width: 0, scaleY: 0.4, opacity: 0 }
    : prefersReducedMotion
      ? { x: 52, width: 0, scaleY: 0.4, opacity: 0 }
      : isOpen
        ? {
            // This neck makes the material connection visible before it fades.
            x: [32, 28, 25, 26, 30, 35, 40, 48, 52],
            width: [0, 8, 18, 26, 30, 25, 18, 6, 0],
            scaleY: [0.4, 0.8, 1.1, 1.3, 1.15, 0.95, 0.75, 0.5, 0.4],
            opacity: [0, 0.75, 1, 1, 1, 1, 0.9, 0.35, 0],
          }
        : {
            // Closing reverses the neck: it reappears as the bar is absorbed.
            x: [52, 52, 48, 42, 36, 30, 26, 28, 32],
            width: [0, 5, 14, 18, 24, 28, 20, 10, 0],
            scaleY: [0.4, 0.5, 0.75, 1, 1.15, 1.25, 1.05, 0.7, 0.4],
            opacity: [0, 0.2, 0.6, 0.9, 1, 1, 0.9, 0.45, 0],
          }

  const inputWidth = isManualPhase
    ? manualPhase === "open"
      ? "100%"
      : manualPhase === "pressure"
        ? percentageOfFinalBarWidth(
            SEARCH_BAR_PRESSURE_WIDTH,
            searchBarFinalWidth,
          )
        : manualPhase === "split"
          ? percentageOfFinalBarWidth(
              SEARCH_BAR_SPLIT_WIDTH,
              searchBarFinalWidth,
            )
          : percentageOfFinalBarWidth(
              SEARCH_BAR_INITIAL_WIDTH,
              searchBarFinalWidth,
            )
    : prefersReducedMotion
      ? isOpen
        ? "100%"
        : "0%"
      : isOpen
        ? [
            percentageOfFinalBarWidth(40, searchBarFinalWidth),
            percentageOfFinalBarWidth(40, searchBarFinalWidth),
            percentageOfFinalBarWidth(42, searchBarFinalWidth),
            percentageOfFinalBarWidth(54, searchBarFinalWidth),
            percentageOfFinalBarWidth(64, searchBarFinalWidth),
            percentageOfFinalBarWidth(72, searchBarFinalWidth),
            percentageOfFinalBarWidth(80, searchBarFinalWidth),
            percentageOfFinalBarWidth(80, searchBarFinalWidth),
            "100%",
          ]
        : [
            "100%",
            "100%",
            "100%",
            "100%",
            percentageOfFinalBarWidth(72, searchBarFinalWidth),
            percentageOfFinalBarWidth(64, searchBarFinalWidth),
            percentageOfFinalBarWidth(52, searchBarFinalWidth),
            percentageOfFinalBarWidth(40, searchBarFinalWidth),
            percentageOfFinalBarWidth(40, searchBarFinalWidth),
          ]

  return {
    barGeometry: positionBarGeometry(localBarGeometry, barDirection, orbLeft),
    connectorGeometry: positionConnectorGeometry(
      localConnectorGeometry,
      barDirection,
      orbLeft,
    ),
    inputWidth,
    orbMotion,
    transition,
  }
}
