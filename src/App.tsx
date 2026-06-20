import { AppErrorBoundary } from "@/app/components/AppErrorBoundary"
import { AppRouter } from "@/app/routing/router"

function App() {
  return (
    <AppErrorBoundary>
      <AppRouter />
    </AppErrorBoundary>
  )
}

export default App
