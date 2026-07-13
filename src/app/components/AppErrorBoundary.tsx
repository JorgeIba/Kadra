import { Component, type ErrorInfo, type ReactNode } from "react"

interface AppErrorBoundaryProps {
  children: ReactNode
}

interface AppErrorBoundaryState {
  error: Error | null
}

interface AppErrorFallbackProps {
  error: Error
  primaryActionLabel: string
  onPrimaryAction: () => void
}

export function AppErrorFallback({
  error,
  primaryActionLabel,
  onPrimaryAction,
}: AppErrorFallbackProps) {
  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground">
      <section className="mx-auto max-w-lg rounded-3xl border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">
          Kadra hit an unexpected problem
        </p>
        <h1 className="mt-3 font-ledger text-3xl tracking-normal">
          Something went wrong
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Your saved local data should still be available. You can try rendering
          the app again, reload the page, or check the browser console for the
          technical error.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            onClick={onPrimaryAction}
          >
            {primaryActionLabel}
          </button>
          <button
            type="button"
            className="rounded-full border px-4 py-2 text-sm font-medium"
            onClick={() => window.location.reload()}
          >
            Reload app
          </button>
        </div>

        <details className="mt-6 rounded-2xl bg-secondary/60 p-4 text-xs text-muted-foreground">
          <summary className="cursor-pointer font-medium">
            Error details
          </summary>
          <pre className="mt-3 overflow-auto whitespace-pre-wrap">
            {error.message}
          </pre>
        </details>
      </section>
    </main>
  )
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    error: null,
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unhandled app render error", error, errorInfo)
  }

  render() {
    if (this.state.error === null) {
      return this.props.children
    }

    return (
      <AppErrorFallback
        error={this.state.error}
        primaryActionLabel="Try again"
        onPrimaryAction={() => this.setState({ error: null })}
      />
    )
  }
}
