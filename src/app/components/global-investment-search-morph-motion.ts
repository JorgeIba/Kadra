import { type Transition } from "motion/react"

export type GlobalInvestmentSearchMorphBarSide = "left" | "right"

export type GlobalInvestmentSearchMorphAnimationPhase =
  | "initial-closed"
  | "closed"
  | "opening"
  | "open"
  | "closing"

export type GlobalInvestmentSearchMorphPlayback =
  | "closed"
  | "opening"
  | "open"
  | "closing"

export const GLOBAL_INVESTMENT_SEARCH_MORPH_ORB_SIZE = 40
export const GLOBAL_INVESTMENT_SEARCH_MORPH_GAP = 8
export const GLOBAL_INVESTMENT_SEARCH_MORPH_MIN_BAR_WIDTH = 80
export const GLOBAL_INVESTMENT_SEARCH_MORPH_MIN_STAGE_WIDTH =
  GLOBAL_INVESTMENT_SEARCH_MORPH_ORB_SIZE +
  GLOBAL_INVESTMENT_SEARCH_MORPH_GAP +
  GLOBAL_INVESTMENT_SEARCH_MORPH_MIN_BAR_WIDTH

export const GLOBAL_INVESTMENT_SEARCH_MORPH_BAR_LEFT =
  GLOBAL_INVESTMENT_SEARCH_MORPH_ORB_SIZE + GLOBAL_INVESTMENT_SEARCH_MORPH_GAP

const SEARCH_BAR_PRESSURE_X = 14
const SEARCH_BAR_PRESSURE_WIDTH = 64
const SEARCH_BAR_RESISTANCE_OFFSET = 2
const PRESSURE_BAR_SCALE_Y = 1.18
const CONTENT_REVEAL_DURATION = 0.18

export const GLOBAL_INVESTMENT_SEARCH_MORPH_MOTION = {
  closeDuration: 0.9,
  easing: "easeInOut" as const,
  openDuration: 1,
}

export type GlobalInvestmentSearchMorphNumericValue =
  | number
  | Array<number | null>
export type GlobalInvestmentSearchMorphDimensionValue =
  | string
  | Array<string | null>

type GlobalInvestmentSearchMorphNumericInput = number | number[]

export type GlobalInvestmentSearchMorphPositionedGeometry = {
  width: GlobalInvestmentSearchMorphNumericValue
  x: GlobalInvestmentSearchMorphNumericValue
}

export type GlobalInvestmentSearchMorphBarGeometry =
  GlobalInvestmentSearchMorphPositionedGeometry & {
    scaleY: GlobalInvestmentSearchMorphNumericValue
  }

export type GlobalInvestmentSearchMorphConnectorGeometry =
  GlobalInvestmentSearchMorphPositionedGeometry & {
    opacity: GlobalInvestmentSearchMorphNumericValue
    scaleY: GlobalInvestmentSearchMorphNumericValue
  }

export type GlobalInvestmentSearchMorphOrbMotion = {
  rotate: GlobalInvestmentSearchMorphNumericValue
  scale: GlobalInvestmentSearchMorphNumericValue
  x: GlobalInvestmentSearchMorphNumericValue
  y: GlobalInvestmentSearchMorphNumericValue
}

export interface GlobalInvestmentSearchMorphVisualModel {
  bar: {
    geometry: GlobalInvestmentSearchMorphBarGeometry
    side: GlobalInvestmentSearchMorphBarSide
  }
  connectorGeometry: GlobalInvestmentSearchMorphConnectorGeometry
  content: {
    position: {
      left: number
      right: number
    }
    transition: Transition
    width: GlobalInvestmentSearchMorphDimensionValue
  }
  orb: {
    left: number
    motion: GlobalInvestmentSearchMorphOrbMotion
  }
  transition: Transition
}

export type GlobalInvestmentSearchMorphInspectionFrame =
  | "closed"
  | "pressure"
  | "split"
  | "expanded"

interface CreateGlobalInvestmentSearchMorphMotionOptions {
  barSide: GlobalInvestmentSearchMorphBarSide
  isOpen: boolean
  orbLeft: number
  prefersReducedMotion: boolean
  searchBarFinalWidth: number
}

interface GetGlobalInvestmentSearchMorphPlaybackOptions {
  animationPhase: GlobalInvestmentSearchMorphAnimationPhase
  isOpen: boolean
  prefersReducedMotion: boolean
}

interface CreateGlobalInvestmentSearchMorphFrameOptions {
  barSide: GlobalInvestmentSearchMorphBarSide
  frame: GlobalInvestmentSearchMorphInspectionFrame
  orbLeft: number
  searchBarFinalWidth: number
}

interface LocalBarGeometry {
  width: number
  x: number
  scaleY: number
}

interface LocalConnectorGeometry {
  opacity: number
  scaleY: number
  width: number
  x: number
}

interface LocalOrbMotion {
  rotate: number
  scale: number
  x: number
  y: number
}

interface MorphAnimationFrame {
  bar: LocalBarGeometry
  connector: LocalConnectorGeometry
  name: string
  orb: LocalOrbMotion
  time: number
}

function createOpenFrames(searchBarFinalWidth: number): MorphAnimationFrame[] {
  const finalWidth = Math.max(
    GLOBAL_INVESTMENT_SEARCH_MORPH_MIN_BAR_WIDTH,
    searchBarFinalWidth,
  )

  return [
    {
      name: "closed",
      time: 0,
      bar: {
        x: 0,
        width: GLOBAL_INVESTMENT_SEARCH_MORPH_ORB_SIZE,
        scaleY: 1,
      },
      connector: { x: 32, width: 0, scaleY: 0.4, opacity: 0 },
      orb: { scale: 1, x: 0, y: 0, rotate: 0 },
    },
    {
      name: "dizzy",
      time: 0.08,
      bar: {
        x: 0,
        width: GLOBAL_INVESTMENT_SEARCH_MORPH_ORB_SIZE,
        scaleY: 1.03,
      },
      connector: { x: 28, width: 8, scaleY: 0.8, opacity: 0.75 },
      orb: { scale: 1.03, x: -4, y: 2.2, rotate: -6 },
    },
    {
      name: "dizzy-recover",
      time: 0.16,
      bar: {
        x: 0,
        width: GLOBAL_INVESTMENT_SEARCH_MORPH_ORB_SIZE + 2,
        scaleY: 0.99,
      },
      connector: { x: 25, width: 18, scaleY: 1.1, opacity: 1 },
      orb: { scale: 0.98, x: 4, y: -2.4, rotate: 6 },
    },
    {
      name: "pressure-start",
      time: 0.24,
      bar: { x: 4, width: 54, scaleY: 1.1 },
      connector: { x: 26, width: 26, scaleY: 1.3, opacity: 1 },
      orb: { scale: 1.06, x: -3.5, y: 1.8, rotate: -4.5 },
    },
    {
      name: "pressure",
      time: 0.34,
      bar: {
        x: SEARCH_BAR_PRESSURE_X,
        width: SEARCH_BAR_PRESSURE_WIDTH,
        scaleY: PRESSURE_BAR_SCALE_Y,
      },
      connector: { x: 30, width: 30, scaleY: 1.15, opacity: 1 },
      orb: { scale: 1.22, x: 3, y: -1.2, rotate: 3 },
    },
    {
      name: "separation",
      time: 0.48,
      bar: { x: 30, width: 72, scaleY: 1.08 },
      connector: { x: 35, width: 25, scaleY: 0.95, opacity: 1 },
      orb: { scale: 1.12, x: 0, y: 0.4, rotate: -1 },
    },
    {
      name: "split",
      time: 0.62,
      bar: {
        x: GLOBAL_INVESTMENT_SEARCH_MORPH_BAR_LEFT,
        width: GLOBAL_INVESTMENT_SEARCH_MORPH_MIN_BAR_WIDTH,
        scaleY: 0.98,
      },
      connector: { x: 40, width: 18, scaleY: 0.75, opacity: 0.9 },
      orb: { scale: 1.04, x: 0, y: 0, rotate: 0 },
    },
    {
      name: "split-settle",
      time: 0.8,
      bar: {
        x: GLOBAL_INVESTMENT_SEARCH_MORPH_BAR_LEFT,
        width: GLOBAL_INVESTMENT_SEARCH_MORPH_MIN_BAR_WIDTH,
        scaleY: 1,
      },
      connector: { x: 48, width: 6, scaleY: 0.5, opacity: 0.35 },
      orb: { scale: 1.02, x: 0, y: 0, rotate: 0 },
    },
    {
      name: "expanded",
      time: 1,
      bar: {
        x: GLOBAL_INVESTMENT_SEARCH_MORPH_BAR_LEFT,
        width: finalWidth,
        scaleY: 1,
      },
      connector: { x: 52, width: 0, scaleY: 0.4, opacity: 0 },
      orb: { scale: 1, x: 0, y: 0, rotate: 0 },
    },
  ]
}

function createCloseFrames(searchBarFinalWidth: number): MorphAnimationFrame[] {
  const finalWidth = Math.max(
    GLOBAL_INVESTMENT_SEARCH_MORPH_MIN_BAR_WIDTH,
    searchBarFinalWidth,
  )
  const resistanceWidth = Math.max(
    GLOBAL_INVESTMENT_SEARCH_MORPH_MIN_BAR_WIDTH,
    finalWidth - SEARCH_BAR_RESISTANCE_OFFSET,
  )
  const finalX = GLOBAL_INVESTMENT_SEARCH_MORPH_BAR_LEFT

  return [
    {
      name: "expanded",
      time: 0,
      bar: { x: finalX, width: finalWidth, scaleY: 1 },
      connector: { x: 52, width: 0, scaleY: 0.4, opacity: 0 },
      orb: { scale: 1, x: 0, y: 0, rotate: 0 },
    },
    {
      name: "closing-resistance",
      time: 0.1,
      bar: {
        x: finalX + SEARCH_BAR_RESISTANCE_OFFSET,
        width: resistanceWidth,
        scaleY: 0.98,
      },
      connector: { x: 52, width: 5, scaleY: 0.5, opacity: 0.2 },
      orb: { scale: 1.025, x: 2.5, y: -1.5, rotate: 3.5 },
    },
    {
      name: "closing-recover",
      time: 0.2,
      bar: { x: finalX, width: finalWidth, scaleY: 1.02 },
      connector: { x: 48, width: 14, scaleY: 0.75, opacity: 0.6 },
      orb: { scale: 1.04, x: -2.5, y: 1.8, rotate: -4 },
    },
    {
      name: "closing-pressure-start",
      time: 0.34,
      bar: { x: finalX, width: finalWidth, scaleY: 1.05 },
      connector: { x: 42, width: 18, scaleY: 1, opacity: 0.9 },
      orb: { scale: 1.08, x: 3, y: -1.6, rotate: 4.5 },
    },
    {
      name: "closing-pressure",
      time: 0.48,
      bar: { x: 40, width: 72, scaleY: 1.18 },
      connector: { x: 36, width: 24, scaleY: 1.15, opacity: 1 },
      orb: { scale: 1.18, x: -3, y: 1.4, rotate: -4 },
    },
    {
      name: "closing-absorb",
      time: 0.62,
      bar: { x: 26, width: 64, scaleY: 1.22 },
      connector: { x: 30, width: 28, scaleY: 1.25, opacity: 1 },
      orb: { scale: 1.24, x: 2, y: -1, rotate: 3 },
    },
    {
      name: "closing-settle-start",
      time: 0.76,
      bar: { x: 12, width: 52, scaleY: 1.1 },
      connector: { x: 26, width: 20, scaleY: 1.05, opacity: 0.9 },
      orb: { scale: 1.12, x: -1.5, y: 0.6, rotate: -1.8 },
    },
    {
      name: "closing-settle",
      time: 0.9,
      bar: {
        x: 0,
        width: GLOBAL_INVESTMENT_SEARCH_MORPH_ORB_SIZE,
        scaleY: 1,
      },
      connector: { x: 28, width: 10, scaleY: 0.7, opacity: 0.45 },
      orb: { scale: 1.04, x: 0.5, y: -0.2, rotate: 0.5 },
    },
    {
      name: "closed",
      time: 1,
      bar: {
        x: 0,
        width: GLOBAL_INVESTMENT_SEARCH_MORPH_ORB_SIZE,
        scaleY: 1,
      },
      connector: { x: 32, width: 0, scaleY: 0.4, opacity: 0 },
      orb: { scale: 1, x: 0, y: 0, rotate: 0 },
    },
  ]
}

function getFrame(
  frames: readonly MorphAnimationFrame[],
  name: GlobalInvestmentSearchMorphInspectionFrame,
): MorphAnimationFrame {
  const frame = frames.find((candidate) => candidate.name === name)

  if (frame === undefined) {
    throw new Error(`Unknown global investment search morph frame: ${name}`)
  }

  return frame
}

function getFrameValues<TValue>(
  frames: readonly MorphAnimationFrame[],
  select: (frame: MorphAnimationFrame) => TValue,
): TValue[] {
  return frames.map(select)
}

function getContentPosition(
  barSide: GlobalInvestmentSearchMorphBarSide,
  orbLeft: number,
) {
  return barSide === "right"
    ? {
        left:
          orbLeft +
          GLOBAL_INVESTMENT_SEARCH_MORPH_ORB_SIZE +
          GLOBAL_INVESTMENT_SEARCH_MORPH_GAP,
        right: 0,
      }
    : {
        left: 0,
        right:
          GLOBAL_INVESTMENT_SEARCH_MORPH_ORB_SIZE +
          GLOBAL_INVESTMENT_SEARCH_MORPH_GAP,
      }
}

function createVisualModelFromFrame(
  frame: MorphAnimationFrame,
  {
    barSide,
    orbLeft,
    searchBarFinalWidth,
  }: Omit<CreateGlobalInvestmentSearchMorphFrameOptions, "frame">,
): GlobalInvestmentSearchMorphVisualModel {
  const barGeometry = positionGlobalInvestmentSearchMorphGeometry(
    frame.bar,
    barSide,
    orbLeft,
  )
  const connectorGeometry = positionGlobalInvestmentSearchMorphGeometry(
    frame.connector,
    barSide,
    orbLeft,
  )

  return {
    bar: {
      geometry: barGeometry,
      side: barSide,
    },
    connectorGeometry,
    content: {
      position: getContentPosition(barSide, orbLeft),
      transition: { duration: 0 },
      width: getGlobalInvestmentSearchMorphContentWidth(
        frame.bar.width,
        searchBarFinalWidth,
      ),
    },
    orb: {
      left: orbLeft,
      motion: frame.orb,
    },
    transition: { duration: 0 },
  }
}

export function positionGlobalInvestmentSearchMorphGeometry<
  TGeometry extends {
    width: GlobalInvestmentSearchMorphNumericInput
    x: GlobalInvestmentSearchMorphNumericInput
  },
>(
  geometry: TGeometry,
  barSide: GlobalInvestmentSearchMorphBarSide,
  orbLeft: number,
): TGeometry {
  return {
    ...geometry,
    x: positionKeyframes(geometry.x, geometry.width, barSide, orbLeft),
  }
}

function positionKeyframes(
  localX: GlobalInvestmentSearchMorphNumericInput,
  width: GlobalInvestmentSearchMorphNumericInput,
  barSide: GlobalInvestmentSearchMorphBarSide,
  orbLeft: number,
): GlobalInvestmentSearchMorphNumericValue {
  const localXValues = Array.isArray(localX) ? localX : [localX]
  const widthValues = Array.isArray(width) ? width : [width]
  const positionedXValues = localXValues.map((x, index) => {
    const currentWidth = widthValues[index] ?? widthValues[0]

    return barSide === "right"
      ? orbLeft + x
      : orbLeft + GLOBAL_INVESTMENT_SEARCH_MORPH_ORB_SIZE - x - currentWidth
  })

  return Array.isArray(localX) ? positionedXValues : positionedXValues[0]
}

export function getGlobalInvestmentSearchMorphContentWidth(
  barWidth: GlobalInvestmentSearchMorphNumericInput,
  searchBarFinalWidth: number,
): GlobalInvestmentSearchMorphDimensionValue {
  if (!Array.isArray(barWidth)) {
    return `${(barWidth / searchBarFinalWidth) * 100}%`
  }

  return barWidth.map((value) => {
    return `${(value / searchBarFinalWidth) * 100}%`
  })
}

function startKeyframesFromCurrent<TValue extends number | string>(
  value: TValue | Array<TValue | null>,
): TValue | Array<TValue | null> {
  return Array.isArray(value) ? [null, ...value.slice(1)] : value
}

function startMotionFromCurrent(
  visualModel: GlobalInvestmentSearchMorphVisualModel,
): GlobalInvestmentSearchMorphVisualModel {
  return {
    ...visualModel,
    bar: {
      ...visualModel.bar,
      geometry: {
        ...visualModel.bar.geometry,
        scaleY: startKeyframesFromCurrent(visualModel.bar.geometry.scaleY),
        width: startKeyframesFromCurrent(visualModel.bar.geometry.width),
        x: startKeyframesFromCurrent(visualModel.bar.geometry.x),
      },
    },
    connectorGeometry: {
      ...visualModel.connectorGeometry,
      opacity: startKeyframesFromCurrent(visualModel.connectorGeometry.opacity),
      scaleY: startKeyframesFromCurrent(visualModel.connectorGeometry.scaleY),
      width: startKeyframesFromCurrent(visualModel.connectorGeometry.width),
      x: startKeyframesFromCurrent(visualModel.connectorGeometry.x),
    },
    content: {
      ...visualModel.content,
      width: startKeyframesFromCurrent(visualModel.content.width),
    },
    orb: {
      ...visualModel.orb,
      motion: {
        ...visualModel.orb.motion,
        rotate: startKeyframesFromCurrent(visualModel.orb.motion.rotate),
        scale: startKeyframesFromCurrent(visualModel.orb.motion.scale),
        x: startKeyframesFromCurrent(visualModel.orb.motion.x),
        y: startKeyframesFromCurrent(visualModel.orb.motion.y),
      },
    },
  }
}

export function getGlobalInvestmentSearchMorphPlayback({
  animationPhase,
  isOpen,
  prefersReducedMotion,
}: GetGlobalInvestmentSearchMorphPlaybackOptions): GlobalInvestmentSearchMorphPlayback {
  if (prefersReducedMotion) {
    return isOpen ? "open" : "closed"
  }

  if (isOpen) {
    return animationPhase === "open" ? "open" : "opening"
  }

  return animationPhase === "initial-closed" || animationPhase === "closed"
    ? "closed"
    : "closing"
}

function createAnimatedVisualModel(
  frames: readonly MorphAnimationFrame[],
  {
    barSide,
    orbLeft,
    searchBarFinalWidth,
  }: Omit<CreateGlobalInvestmentSearchMorphFrameOptions, "frame">,
  transition: Transition,
  contentTransition: Transition,
): GlobalInvestmentSearchMorphVisualModel {
  const barWidth = getFrameValues(frames, (frame) => frame.bar.width)
  const barGeometry = positionGlobalInvestmentSearchMorphGeometry(
    {
      x: getFrameValues(frames, (frame) => frame.bar.x),
      width: barWidth,
      scaleY: getFrameValues(frames, (frame) => frame.bar.scaleY),
    },
    barSide,
    orbLeft,
  )
  const connectorGeometry = positionGlobalInvestmentSearchMorphGeometry(
    {
      x: getFrameValues(frames, (frame) => frame.connector.x),
      width: getFrameValues(frames, (frame) => frame.connector.width),
      scaleY: getFrameValues(frames, (frame) => frame.connector.scaleY),
      opacity: getFrameValues(frames, (frame) => frame.connector.opacity),
    },
    barSide,
    orbLeft,
  )

  return {
    bar: {
      geometry: barGeometry,
      side: barSide,
    },
    connectorGeometry,
    content: {
      position: getContentPosition(barSide, orbLeft),
      transition: contentTransition,
      width: getGlobalInvestmentSearchMorphContentWidth(
        barWidth,
        searchBarFinalWidth,
      ),
    },
    orb: {
      left: orbLeft,
      motion: {
        rotate: getFrameValues(frames, (frame) => frame.orb.rotate),
        scale: getFrameValues(frames, (frame) => frame.orb.scale),
        x: getFrameValues(frames, (frame) => frame.orb.x),
        y: getFrameValues(frames, (frame) => frame.orb.y),
      },
    },
    transition,
  }
}

export function createGlobalInvestmentSearchMorphFrame({
  barSide,
  frame,
  orbLeft,
  searchBarFinalWidth,
}: CreateGlobalInvestmentSearchMorphFrameOptions): GlobalInvestmentSearchMorphVisualModel {
  const openFrames = createOpenFrames(searchBarFinalWidth)

  return createVisualModelFromFrame(getFrame(openFrames, frame), {
    barSide,
    orbLeft,
    searchBarFinalWidth,
  })
}

export function createGlobalInvestmentSearchMorphMotion({
  barSide,
  isOpen,
  orbLeft,
  prefersReducedMotion,
  searchBarFinalWidth,
}: CreateGlobalInvestmentSearchMorphMotionOptions): GlobalInvestmentSearchMorphVisualModel {
  const finalWidth = Math.max(
    GLOBAL_INVESTMENT_SEARCH_MORPH_MIN_BAR_WIDTH,
    searchBarFinalWidth,
  )
  const frames = isOpen
    ? createOpenFrames(finalWidth)
    : createCloseFrames(finalWidth)
  const animationDuration = prefersReducedMotion
    ? 0
    : isOpen
      ? GLOBAL_INVESTMENT_SEARCH_MORPH_MOTION.openDuration
      : GLOBAL_INVESTMENT_SEARCH_MORPH_MOTION.closeDuration
  const transition = prefersReducedMotion
    ? { duration: 0 }
    : {
        duration: animationDuration,
        ease: GLOBAL_INVESTMENT_SEARCH_MORPH_MOTION.easing,
        times: frames.map((frame) => frame.time),
      }
  const contentTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: CONTENT_REVEAL_DURATION, ease: "easeOut" as const }

  if (prefersReducedMotion) {
    return createVisualModelFromFrame(frames.at(-1)!, {
      barSide,
      orbLeft,
      searchBarFinalWidth: finalWidth,
    })
  }

  return startMotionFromCurrent(
    createAnimatedVisualModel(
      frames,
      {
        barSide,
        orbLeft,
        searchBarFinalWidth: finalWidth,
      },
      transition,
      contentTransition,
    ),
  )
}
