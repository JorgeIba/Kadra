import { type ReactNode, type Ref } from "react"
import { useTranslation } from "react-i18next"
import { SearchMorph } from "@/app/components/search-morph/SearchMorph"
interface GlobalInvestmentSearchSurfaceProps {
  children: ReactNode
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onBeforeClose: () => void
  onOpened?: () => void
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
  onOpened,
  onClosed,
  ref: searchSurfaceRef,
  triggerRef,
}: GlobalInvestmentSearchSurfaceProps) {
  const { t } = useTranslation()

  return (
    <SearchMorph
      barSide="left"
      className="pointer-events-none"
      containerRef={searchSurfaceRef}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onBeforeClose={onBeforeClose}
      onOpened={onOpened}
      onClosed={onClosed}
      triggerAriaLabel={
        isOpen ? t("common.search.close") : t("common.search.placeholder")
      }
      triggerRef={triggerRef}
    >
      {children}
    </SearchMorph>
  )
}
