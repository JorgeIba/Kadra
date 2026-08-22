/**
 * Pure adapter from morph keyframes to the visual model consumed by Motion.
 *
 * It resolves bar-side geometry and keyframe tracks but does not render DOM,
 * read layout, or own lifecycle state.
 */
import { type Transition } from "motion/react"
import {
  createMorphClosingFrames,
  createMorphOpeningFrames,
  getMorphAnimationFrame,
  SEARCH_MORPH_ANIMATION_SPEED,
  SEARCH_MORPH_ANIMATION_TIMING,
  SEARCH_MORPH_GAP,
  SEARCH_MORPH_MIN_BAR_WIDTH,
  SEARCH_MORPH_ORB_SIZE,
  type MorphAnimationFrame,
  type MorphInspectionFrame,
} from "@/app/components/search-morph/search-morph-animations"
import type { MorphTarget } from "@/app/components/search-morph/search-morph-machine"

export type MorphBarSide = "left" | "right"

/**
 * A scalar is used by a static frame; an array is a Motion keyframe track.
 * Every track uses the same indexes, so index 3 describes one shared moment
 * across the bar, connector, Orb, and content.
 */
export type MorphNumericValue = number | Array<number | null>
export type MorphDimensionValue = string | Array<string | null>

type MorphNumericInput = number | number[]

export type MorphPositionedGeometry = {
  width: MorphNumericValue
  x: MorphNumericValue
}

export type MorphBarGeometry = MorphPositionedGeometry & {
  scaleY: MorphNumericValue
}

export type MorphConnectorGeometry = MorphPositionedGeometry & {
  opacity: MorphNumericValue
  scaleY: MorphNumericValue
}

export type MorphOrbMotion = {
  rotate: MorphNumericValue
  scale: MorphNumericValue
  x: MorphNumericValue
  y: MorphNumericValue
}

export interface MorphVisualModel {
  bar: {
    geometry: MorphBarGeometry
    side: MorphBarSide
  }
  connectorGeometry: MorphConnectorGeometry
  content: {
    position: {
      left: number
      right: number
    }
    transition: Transition
    width: MorphDimensionValue
  }
  orb: {
    left: number
    motion: MorphOrbMotion
  }
  transition: Transition
}

interface CreateMorphMotionOptions {
  barSide: MorphBarSide
  target: MorphTarget
  orbLeft: number
  expandedBarWidth: number
}

interface CreateMorphFrameOptions {
  barSide: MorphBarSide
  frame: MorphInspectionFrame
  orbLeft: number
  expandedBarWidth: number
}

function getFrameValues<TValue>(
  frames: readonly MorphAnimationFrame[],
  select: (frame: MorphAnimationFrame) => TValue,
): TValue[] {
  // Turn snapshots into one synchronized track, such as all bar widths.
  return frames.map(select)
}

function getContentPosition(barSide: MorphBarSide, orbLeft: number) {
  // Keep the content on the bar's outer side while preserving the Orb-to-bar gap.
  return barSide === "right"
    ? {
        left: orbLeft + SEARCH_MORPH_ORB_SIZE + SEARCH_MORPH_GAP,
        right: 0,
      }
    : {
        left: 0,
        right: SEARCH_MORPH_ORB_SIZE + SEARCH_MORPH_GAP,
      }
}

function createStaticVisualModel(
  frame: MorphAnimationFrame,
  {
    barSide,
    orbLeft,
    expandedBarWidth,
  }: Omit<CreateMorphFrameOptions, "frame">,
): MorphVisualModel {
  // Lab and settled states need one exact pose, so their transitions are instant.
  const barGeometry = positionMorphGeometry(frame.bar, barSide, orbLeft)
  const connectorGeometry = positionMorphGeometry(
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
      width: getMorphContentWidth(frame.bar.width, expandedBarWidth),
    },
    orb: {
      left: orbLeft,
      motion: frame.orb,
    },
    transition: { duration: 0 },
  }
}

export function positionMorphGeometry<
  TGeometry extends {
    width: MorphNumericInput
    x: MorphNumericInput
  },
>(geometry: TGeometry, barSide: MorphBarSide, orbLeft: number): TGeometry {
  // Animation recipes use coordinates relative to the Orb; the renderer needs
  // coordinates in the stage, mirrored when the bar is expelled to the left.
  return {
    ...geometry,
    x: positionKeyframes(geometry.x, geometry.width, barSide, orbLeft),
  }
}

function positionKeyframes(
  localX: MorphNumericInput,
  width: MorphNumericInput,
  barSide: MorphBarSide,
  orbLeft: number,
): MorphNumericValue {
  const localXValues = Array.isArray(localX) ? localX : [localX]
  const widthValues = Array.isArray(width) ? width : [width]
  const positionedXValues = localXValues.map((x, index) => {
    const currentWidth = widthValues[index] ?? widthValues[0]

    // For a left-side bar, x is measured from the Orb's right edge, so subtract
    // both the local offset and the current width to find the global left edge.
    return barSide === "right"
      ? orbLeft + x
      : orbLeft + SEARCH_MORPH_ORB_SIZE - x - currentWidth
  })

  return Array.isArray(localX) ? positionedXValues : positionedXValues[0]
}

export function getMorphContentWidth(
  barWidth: MorphNumericInput,
  expandedBarWidth: number,
): MorphDimensionValue {
  // Content width is expressed as a percentage of the final bar width so the
  // wrapper can reveal with the same keyframe timing as the bar itself.
  if (!Array.isArray(barWidth)) {
    return `${(barWidth / expandedBarWidth) * 100}%`
  }

  return barWidth.map((value) => {
    return `${(value / expandedBarWidth) * 100}%`
  })
}

function startKeyframesFromCurrent<TValue extends number | string>(
  value: TValue | Array<TValue | null>,
): TValue | Array<TValue | null> {
  // Motion keeps the currently rendered value for the first keyframe. This
  // prevents a jump when opening reverses into closing, or vice versa.
  return Array.isArray(value) ? [null, ...value.slice(1)] : value
}

function startMotionFromCurrent(
  visualModel: MorphVisualModel,
): MorphVisualModel {
  // Apply the current-value start to every track that can be mid-transition.
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

function scaleAnimationDuration(baseDuration: number) {
  return baseDuration / SEARCH_MORPH_ANIMATION_SPEED
}

function createAnimatedVisualModel(
  frames: readonly MorphAnimationFrame[],
  {
    barSide,
    orbLeft,
    expandedBarWidth,
  }: Omit<CreateMorphFrameOptions, "frame">,
  transition: Transition,
  contentTransition: Transition,
): MorphVisualModel {
  // Convert each frame snapshot into parallel Motion tracks while preserving
  // the same index-to-moment relationship across every animated property.
  const barWidth = getFrameValues(frames, (frame) => frame.bar.width)
  const barGeometry = positionMorphGeometry(
    {
      x: getFrameValues(frames, (frame) => frame.bar.x),
      width: barWidth,
      scaleY: getFrameValues(frames, (frame) => frame.bar.scaleY),
    },
    barSide,
    orbLeft,
  )
  const connectorGeometry = positionMorphGeometry(
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
      width: getMorphContentWidth(barWidth, expandedBarWidth),
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

export function createMorphFrame({
  barSide,
  frame,
  orbLeft,
  expandedBarWidth,
}: CreateMorphFrameOptions): MorphVisualModel {
  // The Lab asks for a named pose, not a running transition.
  const openingFrames = createMorphOpeningFrames(expandedBarWidth)

  return createStaticVisualModel(getMorphAnimationFrame(openingFrames, frame), {
    barSide,
    orbLeft,
    expandedBarWidth,
  })
}

export function createMorphMotion({
  barSide,
  target,
  orbLeft,
  expandedBarWidth,
}: CreateMorphMotionOptions): MorphVisualModel {
  // Live playback chooses a directional recipe and gives Motion its timeline.
  const finalWidth = Math.max(SEARCH_MORPH_MIN_BAR_WIDTH, expandedBarWidth)
  const frames =
    target === "open"
      ? createMorphOpeningFrames(finalWidth)
      : createMorphClosingFrames(finalWidth)
  const animationDuration =
    target === "open"
      ? scaleAnimationDuration(SEARCH_MORPH_ANIMATION_TIMING.openingDuration)
      : scaleAnimationDuration(SEARCH_MORPH_ANIMATION_TIMING.closingDuration)
  const transition = {
    duration: animationDuration,
    ease: SEARCH_MORPH_ANIMATION_TIMING.easing,
    times: frames.map((frame) => frame.progress),
  }
  const contentTransition = {
    duration: scaleAnimationDuration(
      SEARCH_MORPH_ANIMATION_TIMING.contentRevealDuration,
    ),
    ease: "easeOut" as const,
  }

  return startMotionFromCurrent(
    createAnimatedVisualModel(
      frames,
      {
        barSide,
        orbLeft,
        expandedBarWidth: finalWidth,
      },
      transition,
      contentTransition,
    ),
  )
}

export { type MorphInspectionFrame }
