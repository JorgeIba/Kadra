import { DashboardScreen } from "@/app/screens/dashboard/DashboardScreen"
import { APP_SECTIONS, type AppSection } from "@/app/navigation"
import type { Investment } from "@/domain/investments"

interface ScreenPlaceholderProps {
  activeSection: AppSection
  investments: Investment[]
}

export function ScreenPlaceholder({
  activeSection,
  investments,
}: ScreenPlaceholderProps) {
  switch (activeSection) {
    case APP_SECTIONS.dashboard:
      return <DashboardScreen investments={investments} />
    case APP_SECTIONS.assets:
      return <AssetsPlaceholder />
    case APP_SECTIONS.invest:
      return <InvestPlaceholder />
  }
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
