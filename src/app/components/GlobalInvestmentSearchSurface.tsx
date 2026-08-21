import { type ReactNode, type Ref } from "react"
import { SearchMorph } from "@/app/components/SearchMorph"
interface GlobalInvestmentSearchSurfaceProps {
  children: ReactNode
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onBeforeClose: () => void
  onClosed?: () => void
  ref: Ref<HTMLDivElement>
  triggerRef: Ref<HTMLButtonElement>
}

/**
 * Connects investment-search behavior to the generic SearchMorph.
 * Investment-specific autocomplete content remains composed through children.
 */
export function GlobalInvestmentSearchSurface({
  children,
  isOpen,
  onOpenChange,
  onBeforeClose,
  onClosed,
  ref: searchSurfaceRef,
  triggerRef,
}: GlobalInvestmentSearchSurfaceProps) {
  return (
    <SearchMorph
      barSide="left"
      className="pointer-events-none"
      containerRef={searchSurfaceRef}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onBeforeClose={onBeforeClose}
      onClosed={onClosed}
      triggerAriaLabel={isOpen ? "Close search" : "Search investments"}
      triggerRef={triggerRef}
    >
      {children}
    </SearchMorph>
  )
}
