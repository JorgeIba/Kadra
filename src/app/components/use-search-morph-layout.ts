/**
 * Owns the Morph container's DOM measurement and public container ref bridge.
 *
 * Geometry calculation stays outside the renderer so ResizeObserver and
 * imperative ref handling do not leak into the visual component.
 */
import {
  type Ref,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import {
  SEARCH_MORPH_GAP,
  SEARCH_MORPH_MIN_BAR_WIDTH,
  SEARCH_MORPH_ORB_SIZE,
  SEARCH_MORPH_MIN_STAGE_WIDTH,
} from "@/app/components/search-morph-animations"
import type { MorphBarSide } from "@/app/components/search-morph-motion"

interface UseSearchMorphLayoutOptions {
  barSide: MorphBarSide
  containerRef?: Ref<HTMLDivElement>
}

export function useSearchMorphLayout({
  barSide,
  containerRef,
}: UseSearchMorphLayoutOptions) {
  const containerElementRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(
    SEARCH_MORPH_MIN_STAGE_WIDTH,
  )

  useImperativeHandle(containerRef, () => containerElementRef.current!, [])

  /** Keeps geometry calculations aligned with the actual rendered container. */
  useLayoutEffect(() => {
    const containerElement = containerElementRef.current

    if (containerElement === null) {
      return undefined
    }

    function measureContainerWidth() {
      const nextWidth =
        containerElementRef.current?.getBoundingClientRect().width

      if (nextWidth === undefined) {
        return
      }

      setContainerWidth((currentWidth) => {
        return currentWidth === nextWidth ? currentWidth : nextWidth
      })
    }

    measureContainerWidth()

    const resizeObserver = new ResizeObserver(measureContainerWidth)
    resizeObserver.observe(containerElement)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const usableContainerWidth = Math.max(
    containerWidth,
    SEARCH_MORPH_MIN_STAGE_WIDTH,
  )
  const orbLeft =
    barSide === "right"
      ? 0
      : Math.max(0, usableContainerWidth - SEARCH_MORPH_ORB_SIZE)
  const expandedBarWidth = Math.max(
    SEARCH_MORPH_MIN_BAR_WIDTH,
    usableContainerWidth - SEARCH_MORPH_ORB_SIZE - SEARCH_MORPH_GAP,
  )

  return { containerElementRef, expandedBarWidth, orbLeft }
}
