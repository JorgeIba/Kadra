import { AppErrorBoundary } from "@/app/components/AppErrorBoundary"
import { LocaleProvider } from "@/app/i18n"
import { AppRouter } from "@/app/routing/router"

function App() {
  return (
    <AppErrorBoundary>
      <LocaleProvider>
        <AppRouter />
      </LocaleProvider>
    </AppErrorBoundary>
  )
}

export default App
