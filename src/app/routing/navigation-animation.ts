import { createContext, useContext } from "react"

export const RouteEntryAnimationContext = createContext<boolean>(true)

export function useShouldAnimateRouteEntry() {
  return useContext(RouteEntryAnimationContext)
}
