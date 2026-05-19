import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router"
import { AppShell } from "@/app/AppShell"
import {
  APP_PATHS,
  APP_ROUTE_PATHS,
  APP_SECTIONS,
  getInvestmentDetailPath,
  getSectionPath,
} from "@/app/routing/navigation"
import { getPreviousSectionFromLocation } from "@/app/routing/active-section"
import { AssetsScreen } from "@/app/screens/assets/AssetsScreen"
import { DashboardScreen } from "@/app/screens/dashboard/DashboardScreen"
import { InvestScreen } from "@/app/screens/invest/InvestScreen"
import { InvestmentDetailScreen } from "@/app/screens/investment-detail/InvestmentDetailScreen"
import { sampleInvestments } from "@/domain/investments"

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardRoute />} />
          <Route path={APP_ROUTE_PATHS.assets} element={<AssetsRoute />} />
          <Route path={APP_ROUTE_PATHS.invest} element={<InvestRoute />} />
          <Route
            path={APP_ROUTE_PATHS.investmentDetail}
            element={<InvestmentDetailRoute />}
          />
          <Route path="*" element={<Navigate to={APP_PATHS.dashboard} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function DashboardRoute() {
  const navigate = useNavigate()

  function handleInvestmentSelect(investmentId: string) {
    navigate(getInvestmentDetailPath(investmentId), {
      state: { fromSection: APP_SECTIONS.dashboard },
    })
  }

  return (
    <DashboardScreen
      investments={sampleInvestments}
      onInvestmentSelect={handleInvestmentSelect}
    />
  )
}

function AssetsRoute() {
  const navigate = useNavigate()

  function handleInvestmentSelect(investmentId: string) {
    navigate(getInvestmentDetailPath(investmentId), {
      state: { fromSection: APP_SECTIONS.assets },
    })
  }

  return (
    <AssetsScreen
      investments={sampleInvestments}
      onInvestmentSelect={handleInvestmentSelect}
    />
  )
}

function InvestRoute() {
  return <InvestScreen />
}

function InvestmentDetailRoute() {
  const navigate = useNavigate()
  const location = useLocation()
  const { investmentId } = useParams()
  const previousSection = getPreviousSectionFromLocation(location)
  const selectedInvestment = sampleInvestments.find((investment) => {
    return investment.id === investmentId
  })

  function handleBack() {
    navigate(getSectionPath(previousSection))
  }

  if (selectedInvestment === undefined) {
    return <InvestmentNotFound onBack={handleBack} />
  }

  return (
    <InvestmentDetailScreen
      investment={selectedInvestment}
      onBack={handleBack}
    />
  )
}

function InvestmentNotFound({ onBack }: { onBack: () => void }) {
  return (
    <section className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">Investment</p>
      <h1 className="text-3xl font-semibold tracking-normal">Not found</h1>
      <p className="max-w-sm text-sm leading-6 text-muted-foreground">
        This investment is not available in the current local data.
      </p>
      <button
        type="button"
        className="text-sm font-medium text-primary"
        onClick={onBack}
      >
        Back to list
      </button>
    </section>
  )
}
