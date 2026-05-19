import { useLocation } from "react-router"
import { getActiveSectionFromLocation } from "@/app/routing/active-section"

export function useActiveAppSection() {
  return getActiveSectionFromLocation(useLocation())
}
