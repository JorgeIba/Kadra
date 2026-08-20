/**
 * Pure visual recipes for the search morph.
 *
 * This module defines geometry, timing, and named keyframes. It has no React,
 * Motion, DOM, or state-machine responsibilities, so the animation can be
 * inspected and tested independently from rendering.
 */
export const SEARCH_MORPH_ORB_SIZE = 40
export const SEARCH_MORPH_GAP = 8
export const SEARCH_MORPH_MIN_BAR_WIDTH = 80
export const SEARCH_MORPH_MIN_STAGE_WIDTH =
  SEARCH_MORPH_ORB_SIZE + SEARCH_MORPH_GAP + SEARCH_MORPH_MIN_BAR_WIDTH

export const SEARCH_MORPH_BAR_SEPARATION_OFFSET =
  SEARCH_MORPH_ORB_SIZE + SEARCH_MORPH_GAP

export const SEARCH_MORPH_ANIMATION_TIMING = {
  closingDuration: 0.9,
  easing: "easeInOut" as const,
  openingDuration: 1,
}
export const SEARCH_MORPH_CONTENT_REVEAL_DURATION = 0.18

const SEARCH_BAR_PRESSURE_X = 14
const SEARCH_BAR_PRESSURE_WIDTH = 64
const SEARCH_BAR_RESISTANCE_OFFSET = 2
const PRESSURE_BAR_SCALE_Y = 1.18

export type MorphInspectionFrame = "closed" | "pressure" | "split" | "expanded"

type MorphAnimationFrameName =
  | MorphInspectionFrame
  | "closing-absorb"
  | "closing-pressure"
  | "closing-pressure-start"
  | "closing-recover"
  | "closing-resistance"
  | "closing-settle"
  | "closing-settle-start"
  | "dizzy"
  | "dizzy-recover"
  | "pressure-start"
  | "separation"
  | "split-settle"

export interface MorphAnimationFrame {
  name: MorphAnimationFrameName
  progress: number
  bar: {
    width: number
    x: number
    scaleY: number
  }
  connector: {
    opacity: number
    scaleY: number
    width: number
    x: number
  }
  orb: {
    rotate: number
    scale: number
    x: number
    y: number
  }
}

export function createMorphOpeningFrames(
  expandedBarWidth: number,
): MorphAnimationFrame[] {
  const finalWidth = Math.max(SEARCH_MORPH_MIN_BAR_WIDTH, expandedBarWidth)

  return [
    {
      name: "closed",
      progress: 0,
      bar: {
        x: 0,
        width: SEARCH_MORPH_ORB_SIZE,
        scaleY: 1,
      },
      connector: { x: 32, width: 0, scaleY: 0.4, opacity: 0 },
      orb: { scale: 1, x: 0, y: 0, rotate: 0 },
    },
    {
      name: "dizzy",
      progress: 0.08,
      bar: {
        x: 0,
        width: SEARCH_MORPH_ORB_SIZE,
        scaleY: 1.03,
      },
      connector: { x: 28, width: 8, scaleY: 0.8, opacity: 0.75 },
      orb: { scale: 1.03, x: -4, y: 2.2, rotate: -6 },
    },
    {
      name: "dizzy-recover",
      progress: 0.16,
      bar: {
        x: 0,
        width: SEARCH_MORPH_ORB_SIZE + 2,
        scaleY: 0.99,
      },
      connector: { x: 25, width: 18, scaleY: 1.1, opacity: 1 },
      orb: { scale: 0.98, x: 4, y: -2.4, rotate: 6 },
    },
    {
      name: "pressure-start",
      progress: 0.24,
      bar: { x: 4, width: 54, scaleY: 1.1 },
      connector: { x: 26, width: 26, scaleY: 1.3, opacity: 1 },
      orb: { scale: 1.06, x: -3.5, y: 1.8, rotate: -4.5 },
    },
    {
      name: "pressure",
      progress: 0.34,
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
      progress: 0.48,
      bar: { x: 30, width: 72, scaleY: 1.08 },
      connector: { x: 35, width: 25, scaleY: 0.95, opacity: 1 },
      orb: { scale: 1.12, x: 0, y: 0.4, rotate: -1 },
    },
    {
      name: "split",
      progress: 0.62,
      bar: {
        x: SEARCH_MORPH_BAR_SEPARATION_OFFSET,
        width: SEARCH_MORPH_MIN_BAR_WIDTH,
        scaleY: 0.98,
      },
      connector: { x: 40, width: 18, scaleY: 0.75, opacity: 0.9 },
      orb: { scale: 1.04, x: 0, y: 0, rotate: 0 },
    },
    {
      name: "split-settle",
      progress: 0.8,
      bar: {
        x: SEARCH_MORPH_BAR_SEPARATION_OFFSET,
        width: SEARCH_MORPH_MIN_BAR_WIDTH,
        scaleY: 1,
      },
      connector: { x: 48, width: 6, scaleY: 0.5, opacity: 0.35 },
      orb: { scale: 1.02, x: 0, y: 0, rotate: 0 },
    },
    {
      name: "expanded",
      progress: 1,
      bar: {
        x: SEARCH_MORPH_BAR_SEPARATION_OFFSET,
        width: finalWidth,
        scaleY: 1,
      },
      connector: { x: 52, width: 0, scaleY: 0.4, opacity: 0 },
      orb: { scale: 1, x: 0, y: 0, rotate: 0 },
    },
  ]
}

export function createMorphClosingFrames(
  expandedBarWidth: number,
): MorphAnimationFrame[] {
  const finalWidth = Math.max(SEARCH_MORPH_MIN_BAR_WIDTH, expandedBarWidth)
  const resistanceWidth = Math.max(
    SEARCH_MORPH_MIN_BAR_WIDTH,
    finalWidth - SEARCH_BAR_RESISTANCE_OFFSET,
  )
  const finalX = SEARCH_MORPH_BAR_SEPARATION_OFFSET

  return [
    {
      name: "expanded",
      progress: 0,
      bar: { x: finalX, width: finalWidth, scaleY: 1 },
      connector: { x: 52, width: 0, scaleY: 0.4, opacity: 0 },
      orb: { scale: 1, x: 0, y: 0, rotate: 0 },
    },
    {
      name: "closing-resistance",
      progress: 0.1,
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
      progress: 0.2,
      bar: { x: finalX, width: finalWidth, scaleY: 1.02 },
      connector: { x: 48, width: 14, scaleY: 0.75, opacity: 0.6 },
      orb: { scale: 1.04, x: -2.5, y: 1.8, rotate: -4 },
    },
    {
      name: "closing-pressure-start",
      progress: 0.34,
      bar: { x: finalX, width: finalWidth, scaleY: 1.05 },
      connector: { x: 42, width: 18, scaleY: 1, opacity: 0.9 },
      orb: { scale: 1.08, x: 3, y: -1.6, rotate: 4.5 },
    },
    {
      name: "closing-pressure",
      progress: 0.48,
      bar: { x: 40, width: 72, scaleY: 1.18 },
      connector: { x: 36, width: 24, scaleY: 1.15, opacity: 1 },
      orb: { scale: 1.18, x: -3, y: 1.4, rotate: -4 },
    },
    {
      name: "closing-absorb",
      progress: 0.62,
      bar: { x: 26, width: 64, scaleY: 1.22 },
      connector: { x: 30, width: 28, scaleY: 1.25, opacity: 1 },
      orb: { scale: 1.24, x: 2, y: -1, rotate: 3 },
    },
    {
      name: "closing-settle-start",
      progress: 0.76,
      bar: { x: 12, width: 52, scaleY: 1.1 },
      connector: { x: 26, width: 20, scaleY: 1.05, opacity: 0.9 },
      orb: { scale: 1.12, x: -1.5, y: 0.6, rotate: -1.8 },
    },
    {
      name: "closing-settle",
      progress: 0.9,
      bar: {
        x: 0,
        width: SEARCH_MORPH_ORB_SIZE,
        scaleY: 1,
      },
      connector: { x: 28, width: 10, scaleY: 0.7, opacity: 0.45 },
      orb: { scale: 1.04, x: 0.5, y: -0.2, rotate: 0.5 },
    },
    {
      name: "closed",
      progress: 1,
      bar: {
        x: 0,
        width: SEARCH_MORPH_ORB_SIZE,
        scaleY: 1,
      },
      connector: { x: 32, width: 0, scaleY: 0.4, opacity: 0 },
      orb: { scale: 1, x: 0, y: 0, rotate: 0 },
    },
  ]
}

export function getMorphAnimationFrame(
  frames: readonly MorphAnimationFrame[],
  name: MorphInspectionFrame,
): MorphAnimationFrame {
  const frame = frames.find((candidate) => candidate.name === name)

  if (frame === undefined) {
    throw new Error(`Unknown global investment search morph frame: ${name}`)
  }

  return frame
}
