import { describe, expect, it } from "vitest"
import {
  createMorphFrame,
  createMorphMotion,
  type MorphVisualModel,
} from "@/app/components/search-morph/search-morph-motion"
import {
  SEARCH_MORPH_BAR_SEPARATION_OFFSET,
  SEARCH_MORPH_ANIMATION_SPEED,
  SEARCH_MORPH_ANIMATION_TIMING,
  SEARCH_MORPH_MIN_BAR_WIDTH,
  SEARCH_MORPH_ORB_SIZE,
} from "@/app/components/search-morph/search-morph-animations"

const sharedOptions = {
  barSide: "right" as const,
  orbLeft: 0,
  expandedBarWidth: 300,
}

function expectAnimatedTracksToMatchTransition(motion: MorphVisualModel) {
  const times = motion.transition.times

  if (!Array.isArray(times)) {
    throw new Error("Expected an animated transition with keyframe times")
  }

  const trackValues = [
    motion.bar.geometry.x,
    motion.bar.geometry.width,
    motion.bar.geometry.scaleY,
    motion.connectorGeometry.x,
    motion.connectorGeometry.width,
    motion.connectorGeometry.scaleY,
    motion.connectorGeometry.opacity,
    motion.content.width,
    motion.orb.motion.rotate,
    motion.orb.motion.scale,
    motion.orb.motion.x,
    motion.orb.motion.y,
  ]

  for (const track of trackValues) {
    expect(track).toHaveLength(times.length)
  }
}

describe("global investment search morph motion", () => {
  it("keeps the opening animation in one ordered sequence", () => {
    const motion = createMorphMotion({
      ...sharedOptions,
      target: "open",
    })

    expect(motion.bar.geometry).toMatchObject({
      x: [
        null,
        0,
        0,
        4,
        14,
        30,
        SEARCH_MORPH_BAR_SEPARATION_OFFSET,
        SEARCH_MORPH_BAR_SEPARATION_OFFSET,
        SEARCH_MORPH_BAR_SEPARATION_OFFSET,
      ],
      width: [
        null,
        SEARCH_MORPH_ORB_SIZE,
        SEARCH_MORPH_ORB_SIZE + 2,
        54,
        64,
        72,
        80,
        80,
        300,
      ],
    })
    expect(motion.connectorGeometry).toMatchObject({
      width: [null, 8, 18, 26, 30, 25, 18, 6, 0],
      opacity: [null, 0.75, 1, 1, 1, 1, 0.9, 0.35, 0],
    })
    expect(motion.transition).toMatchObject({
      duration:
        SEARCH_MORPH_ANIMATION_TIMING.openingDuration /
        SEARCH_MORPH_ANIMATION_SPEED,
      ease: "easeInOut",
      times: [0, 0.08, 0.16, 0.24, 0.34, 0.48, 0.62, 0.8, 1],
    })
    expect(motion.content.transition).toMatchObject({
      duration:
        SEARCH_MORPH_ANIMATION_TIMING.contentRevealDuration /
        SEARCH_MORPH_ANIMATION_SPEED,
    })
  })

  it("reverses the material choreography when closing", () => {
    const motion = createMorphMotion({
      ...sharedOptions,
      target: "closed",
    })

    expect(motion.bar.geometry).toMatchObject({
      x: [
        null,
        SEARCH_MORPH_BAR_SEPARATION_OFFSET + 2,
        SEARCH_MORPH_BAR_SEPARATION_OFFSET,
        SEARCH_MORPH_BAR_SEPARATION_OFFSET,
        40,
        26,
        12,
        0,
        0,
      ],
      width: [
        null,
        298,
        300,
        300,
        72,
        64,
        52,
        SEARCH_MORPH_ORB_SIZE,
        SEARCH_MORPH_ORB_SIZE,
      ],
    })
    expect(motion.connectorGeometry).toMatchObject({
      width: [null, 5, 14, 18, 24, 28, 20, 10, 0],
      opacity: [null, 0.2, 0.6, 0.9, 1, 1, 0.9, 0.45, 0],
    })
    expect(motion.transition).toMatchObject({
      duration:
        SEARCH_MORPH_ANIMATION_TIMING.closingDuration /
        SEARCH_MORPH_ANIMATION_SPEED,
      times: [0, 0.1, 0.2, 0.34, 0.48, 0.62, 0.76, 0.9, 1],
    })
    expectAnimatedTracksToMatchTransition(motion)
  })

  it("keeps every animated track aligned with the transition", () => {
    const motion = createMorphMotion({
      ...sharedOptions,
      target: "open",
    })

    expectAnimatedTracksToMatchTransition(motion)
  })

  it("mirrors animated geometry for a left-side bar", () => {
    const motion = createMorphMotion({
      barSide: "left",
      target: "open",
      orbLeft: 260,
      expandedBarWidth: 252,
    })

    expect(motion.bar.geometry.x).toEqual([
      null,
      260,
      258,
      234,
      214,
      190,
      172,
      172,
      0,
    ])
    expect(motion.bar.geometry.width).toEqual([
      null,
      SEARCH_MORPH_ORB_SIZE,
      SEARCH_MORPH_ORB_SIZE + 2,
      54,
      64,
      72,
      80,
      80,
      252,
    ])
    expect(motion.content.position).toEqual({
      left: 0,
      right: SEARCH_MORPH_BAR_SEPARATION_OFFSET,
    })
  })

  it("uses live animation frames for manual inspection states", () => {
    const pressure = createMorphFrame({
      ...sharedOptions,
      frame: "pressure",
    })
    const split = createMorphFrame({
      ...sharedOptions,
      frame: "split",
    })

    expect(pressure.bar.geometry).toMatchObject({ width: 64, x: 14 })
    expect(pressure.connectorGeometry).toMatchObject({ width: 30, x: 30 })
    expect(pressure.orb.motion).toMatchObject({ scale: 1.22, rotate: 3 })
    expect(split.bar.geometry).toMatchObject({
      width: SEARCH_MORPH_MIN_BAR_WIDTH,
      x: SEARCH_MORPH_BAR_SEPARATION_OFFSET,
    })
  })

  it("uses the configured orb size as the closed bar width", () => {
    const motion = createMorphMotion({
      ...sharedOptions,
      target: "closed",
    })

    expect(motion.bar.geometry.width).toEqual([
      null,
      298,
      300,
      300,
      72,
      64,
      52,
      SEARCH_MORPH_ORB_SIZE,
      SEARCH_MORPH_ORB_SIZE,
    ])
  })
})
