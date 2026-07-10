import {
  useLocation,
  useNavigate,
  type NavigateOptions,
  type To,
} from "react-router"

export function useBackOrFallbackNavigation() {
  const location = useLocation()
  const navigate = useNavigate()

  return (fallbackTo: To, fallbackOptions?: NavigateOptions) => {
    if (location.key !== "default") {
      navigate(-1)
      return
    }

    navigate(fallbackTo, { ...fallbackOptions, replace: true })
  }
}
