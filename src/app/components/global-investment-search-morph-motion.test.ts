import { describe, expect, it } from "vitest"
import {
  createGlobalInvestmentSearchMorphFrame,
  createGlobalInvestmentSearchMorphMotion,
  getGlobalInvestmentSearchMorphPlayback,
  GLOBAL_INVESTMENT_SEARCH_MORPH_BAR_LEFT,
  GLOBAL_INVESTMENT_SEARCH_MORPH_ORB_SIZE,
  type GlobalInvestmentSearchMorphVisualModel,
} from "@/app/components/global-investment-search-morph-motion"

const sharedOptions = {
  barSide: "right" as const,
  orbLeft: 0,
  searchBarFinalWidth: 300,
}

function expectAnimatedTracksToMatchTransition(
  motion: GlobalInvestmentSearchMorphVisualModel,
) {
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
  it("selects static settled states and only plays during transitions", () => {
    expect(
      getGlobalInvestmentSearchMorphPlayback({
        animationPhase: "initial-closed",
        isOpen: false,
        prefersReducedMotion: false,
      }),
    ).toBe("closed")
    expect(
      getGlobalInvestmentSearchMorphPlayback({
        animationPhase: "closed",
        isOpen: true,
        prefersReducedMotion: false,
      }),
    ).toBe("opening")
    expect(
      getGlobalInvestmentSearchMorphPlayback({
        animationPhase: "open",
        isOpen: true,
        prefersReducedMotion: false,
      }),
    ).toBe("open")
    expect(
      getGlobalInvestmentSearchMorphPlayback({
        animationPhase: "open",
        isOpen: false,
        prefersReducedMotion: false,
      }),
    ).toBe("closing")
    expect(
      getGlobalInvestmentSearchMorphPlayback({
        animationPhase: "closing",
        isOpen: true,
        prefersReducedMotion: false,
      }),
    ).toBe("opening")
  })

  it("settles immediately in the requested state for reduced motion", () => {
    expect(
      getGlobalInvestmentSearchMorphPlayback({
        animationPhase: "initial-closed",
        isOpen: true,
        prefersReducedMotion: true,
      }),
    ).toBe("open")
    expect(
      getGlobalInvestmentSearchMorphPlayback({
        animationPhase: "open",
        isOpen: false,
        prefersReducedMotion: true,
      }),
    ).toBe("closed")
  })

  it("keeps the open choreography in one ordered sequence", () => {
    const motion = createGlobalInvestmentSearchMorphMotion({
      ...sharedOptions,
      isOpen: true,
      prefersReducedMotion: false,
    })

    expect(motion.bar.geometry).toMatchObject({
      x: [
        null,
        0,
        0,
        4,
        14,
        30,
        GLOBAL_INVESTMENT_SEARCH_MORPH_BAR_LEFT,
        GLOBAL_INVESTMENT_SEARCH_MORPH_BAR_LEFT,
        GLOBAL_INVESTMENT_SEARCH_MORPH_BAR_LEFT,
      ],
      width: [null, 40, 42, 54, 64, 72, 80, 80, 300],
    })
    expect(motion.connectorGeometry).toMatchObject({
      width: [null, 8, 18, 26, 30, 25, 18, 6, 0],
      opacity: [null, 0.75, 1, 1, 1, 1, 0.9, 0.35, 0],
    })
    expect(motion.transition).toMatchObject({
      duration: 1,
      ease: "easeInOut",
      times: [0, 0.08, 0.16, 0.24, 0.34, 0.48, 0.62, 0.8, 1],
    })
  })

  it("reverses the material choreography when closing", () => {
    const motion = createGlobalInvestmentSearchMorphMotion({
      ...sharedOptions,
      isOpen: false,
      prefersReducedMotion: false,
    })

    expect(motion.bar.geometry).toMatchObject({
      x: [null, 50, 48, 48, 40, 26, 12, 0, 0],
      width: [null, 298, 300, 300, 72, 64, 52, 40, 40],
    })
    expect(motion.connectorGeometry).toMatchObject({
      width: [null, 5, 14, 18, 24, 28, 20, 10, 0],
      opacity: [null, 0.2, 0.6, 0.9, 1, 1, 0.9, 0.45, 0],
    })
    expect(motion.transition).toMatchObject({
      duration: 0.9,
      times: [0, 0.1, 0.2, 0.34, 0.48, 0.62, 0.76, 0.9, 1],
    })
    expectAnimatedTracksToMatchTransition(motion)
  })

  it("keeps every animated track aligned with the transition", () => {
    const motion = createGlobalInvestmentSearchMorphMotion({
      ...sharedOptions,
      isOpen: true,
      prefersReducedMotion: false,
    })

    expectAnimatedTracksToMatchTransition(motion)
  })

  it("mirrors animated geometry for a left-side bar", () => {
    const motion = createGlobalInvestmentSearchMorphMotion({
      barSide: "left",
      isOpen: true,
      orbLeft: 260,
      prefersReducedMotion: false,
      searchBarFinalWidth: 252,
    })

    expect(motion.bar.geometry.x).toEqual([
      null,
      260,
      258,
      242,
      222,
      198,
      172,
      172,
      0,
    ])
    expect(motion.bar.geometry.width).toEqual([
      null,
      40,
      42,
      54,
      64,
      72,
      80,
      80,
      252,
    ])
    expect(motion.content.position).toEqual({ left: 0, right: 48 })
  })

  it("uses live choreography frames for manual inspection states", () => {
    const pressure = createGlobalInvestmentSearchMorphFrame({
      ...sharedOptions,
      frame: "pressure",
    })
    const split = createGlobalInvestmentSearchMorphFrame({
      ...sharedOptions,
      frame: "split",
    })

    expect(pressure.bar.geometry).toMatchObject({ width: 64, x: 14 })
    expect(pressure.connectorGeometry).toMatchObject({ width: 30, x: 30 })
    expect(pressure.orb.motion).toMatchObject({ scale: 1.22, rotate: 3 })
    expect(split.bar.geometry).toMatchObject({
      width: GLOBAL_INVESTMENT_SEARCH_MORPH_ORB_SIZE * 2,
      x: GLOBAL_INVESTMENT_SEARCH_MORPH_BAR_LEFT,
    })
  })

  it("settles immediately when reduced motion is requested", () => {
    const motion = createGlobalInvestmentSearchMorphMotion({
      ...sharedOptions,
      isOpen: true,
      prefersReducedMotion: true,
    })

    expect(motion.transition).toEqual({ duration: 0 })
    expect(motion.content.transition).toEqual({ duration: 0 })
    expect(motion.orb.motion).toEqual({ scale: 1, x: 0, y: 0, rotate: 0 })
    expect(motion.bar.geometry).toEqual({
      x: GLOBAL_INVESTMENT_SEARCH_MORPH_BAR_LEFT,
      width: 300,
      scaleY: 1,
    })
  })

  it("uses the configured orb size as the closed bar width", () => {
    const motion = createGlobalInvestmentSearchMorphMotion({
      ...sharedOptions,
      isOpen: false,
      prefersReducedMotion: true,
    })

    expect(motion.bar.geometry).toEqual({
      x: 0,
      width: GLOBAL_INVESTMENT_SEARCH_MORPH_ORB_SIZE,
      scaleY: 1,
    })
  })
})
