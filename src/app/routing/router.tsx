import {
  Navigate,
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  useRouteError,
} from "react-router"
import { RouterProvider } from "react-router/dom"
import { AppShell } from "@/app/AppShell"
import { AppErrorFallback } from "@/app/components/AppErrorBoundary"
import { InvestmentsProvider } from "@/app/context/InvestmentsProvider"
import { useInvestments } from "@/app/context/investments-context"
import { APP_PATHS, APP_ROUTE_PATHS } from "@/app/routing/navigation"
import {
  AssetsRoute,
  DashboardRoute,
  EarningsRoute,
  EditInvestmentRoute,
  InvestRoute,
  InvestmentDetailRoute,
  ProjectionRoute,
  RecordChangeRoute,
} from "@/app/routing/routes"

const appRouter = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AppShellRoute />} errorElement={<AppRouteError />}>
      <Route index element={<DashboardRoute />} />
      <Route path={APP_ROUTE_PATHS.assets} element={<AssetsRoute />} />
      <Route path={APP_ROUTE_PATHS.invest} element={<InvestRoute />} />
      <Route path={APP_ROUTE_PATHS.earnings} element={<EarningsRoute />} />
      <Route path={APP_ROUTE_PATHS.projection} element={<ProjectionRoute />} />
      <Route
        path={APP_ROUTE_PATHS.investmentDetail}
        element={<InvestmentDetailRoute />}
      />
      <Route
        path={APP_ROUTE_PATHS.investmentEdit}
        element={<EditInvestmentRoute />}
      />
      <Route
        path={APP_ROUTE_PATHS.investmentRecordChange}
        element={<RecordChangeRoute />}
      />
      <Route path="*" element={<Navigate to={APP_PATHS.dashboard} replace />} />
    </Route>,
  ),
)

export function AppRouter() {
  return (
    <InvestmentsProvider>
      <RouterProvider router={appRouter} />
    </InvestmentsProvider>
  )
}

function AppShellRoute() {
  const { resetLocalData } = useInvestments()

  return <AppShell onResetLocalData={resetLocalData} />
}

function AppRouteError() {
  const routeError = useRouteError()
  const error =
    routeError instanceof Error
      ? routeError
      : new Error("Unknown route rendering error")

  return (
    <AppErrorFallback
      error={error}
      primaryActionLabel="Go home"
      onPrimaryAction={() => window.location.assign(APP_PATHS.dashboard)}
    />
  )
}
