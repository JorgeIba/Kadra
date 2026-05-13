import { APP_SECTIONS, type AppSection } from "@/app/navigation"

interface ScreenPlaceholderProps {
  activeSection: AppSection
  investmentCount: number
}

export function ScreenPlaceholder({
  activeSection,
  investmentCount,
}: ScreenPlaceholderProps) {
  switch (activeSection) {
    case APP_SECTIONS.dashboard:
      return <DashboardPlaceholder investmentCount={investmentCount} />
    case APP_SECTIONS.assets:
      return <AssetsPlaceholder />
    case APP_SECTIONS.invest:
      return <InvestPlaceholder />
  }
}

function DashboardPlaceholder({
  investmentCount,
}: {
  investmentCount: number
}) {
  return (
    <section className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">Dashboard</p>
      <h1 className="text-3xl font-semibold tracking-normal">
        Portfolio snapshot
      </h1>
      <p className="max-w-sm text-sm leading-6 text-muted-foreground">
        Shell ready. Next we will add the total value card, daily cash flow, and
        a short investment preview list.
      </p>
      <p className="rounded-lg border bg-card px-4 py-3 text-sm text-card-foreground">
        Sample investments loaded: {investmentCount}
      </p>
    </section>
  )
}

function AssetsPlaceholder() {
  return (
    <section className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">Assets</p>
      <h1 className="text-3xl font-semibold tracking-normal">
        All investments
      </h1>
      <p className="max-w-sm text-sm leading-6 text-muted-foreground">
        This screen will hold the full investment list and open details when an
        investment card is selected.
      </p>
    </section>
  )
}

function InvestPlaceholder() {
  return (
    <section className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">Invest</p>
      <h1 className="text-3xl font-semibold tracking-normal">New investment</h1>
      <p className="max-w-sm text-sm leading-6 text-muted-foreground">
        This screen will hold the single investment form and its live preview.
      </p>
    </section>
  )
}
