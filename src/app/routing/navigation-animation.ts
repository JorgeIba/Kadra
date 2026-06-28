import { createContext, useContext } from "react"
import { useNavigate, type NavigateOptions, type To } from "react-router"

export const NavigationAnimationContext = createContext<boolean>(true)

export function useShouldAnimateOnMount() {
  return useContext(NavigationAnimationContext)
}

export function useAnimatedNavigate() {
  const navigate = useNavigate()

  return (to: To | number, options?: NavigateOptions) => {
    if (typeof to === "number") {
      navigate(to)
      return
    }

    navigate(to, { ...options, viewTransition: true })
  }
}
