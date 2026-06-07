import { useEffect, useState } from "react"
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
  getInvestmentEditPath,
  getSectionPath,
} from "@/app/routing/navigation"
import { getPreviousSectionFromLocation } from "@/app/routing/active-section"
import { AssetsScreen } from "@/app/screens/assets/AssetsScreen"
import { DashboardScreen } from "@/app/screens/dashboard/DashboardScreen"
import { EditInvestmentScreen } from "@/app/screens/edit-investment/EditInvestmentScreen"
import { InvestScreen } from "@/app/screens/invest/InvestScreen"
import { InvestmentDetailScreen } from "@/app/screens/investment-detail/InvestmentDetailScreen"
import {
  loadInvestmentsFromStorage,
  saveInvestmentsToStorage,
} from "@/app/storage/investments-storage"
import { sampleInvestments, type Investment } from "@/domain/investments"

export function AppRouter() {
  const [investments, setInvestments] = useState<Investment[]>(() => {
    return loadInvestmentsFromStorage(sampleInvestments)
  })

  useEffect(() => {
    saveInvestmentsToStorage(investments)
  }, [investments])

  function addInvestment(investment: Investment) {
    setInvestments((currentInvestments) => {
      return [investment, ...currentInvestments]
    })
  }

  function deleteInvestment(investmentId: string) {
    setInvestments((currentInvestments) => {
      return currentInvestments.filter((investment) => {
        return investment.id !== investmentId
      })
    })
  }

  function updateInvestment(updatedInvestment: Investment) {
    setInvestments((currentInvestments) => {
      return currentInvestments.map((investment) => {
        if (investment.id !== updatedInvestment.id) {
          return investment
        }

        return updatedInvestment
      })
    })
  }

  function resetLocalData() {
    setInvestments(sampleInvestments)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell onResetLocalData={resetLocalData} />}>
          <Route index element={<DashboardRoute investments={investments} />} />
          <Route
            path={APP_ROUTE_PATHS.assets}
            element={<AssetsRoute investments={investments} />}
          />
          <Route
            path={APP_ROUTE_PATHS.invest}
            element={<InvestRoute addInvestment={addInvestment} />}
          />
          <Route
            path={APP_ROUTE_PATHS.investmentDetail}
            element={
              <InvestmentDetailRoute
                deleteInvestment={deleteInvestment}
                investments={investments}
              />
            }
          />
          <Route
            path={APP_ROUTE_PATHS.investmentEdit}
            element={
              <EditInvestmentRoute
                investments={investments}
                updateInvestment={updateInvestment}
              />
            }
          />
          <Route path="*" element={<Navigate to={APP_PATHS.dashboard} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function DashboardRoute({ investments }: { investments: Investment[] }) {
  const navigate = useNavigate()

  function handleAddInvestment() {
    navigate(getSectionPath(APP_SECTIONS.invest), {
      state: { fromSection: APP_SECTIONS.dashboard },
    })
  }

  function handleInvestmentSelect(investmentId: string) {
    navigate(getInvestmentDetailPath(investmentId), {
      state: { fromSection: APP_SECTIONS.dashboard },
    })
  }

  return (
    <DashboardScreen
      investments={investments}
      onAddInvestment={handleAddInvestment}
      onInvestmentSelect={handleInvestmentSelect}
    />
  )
}

function AssetsRoute({ investments }: { investments: Investment[] }) {
  const navigate = useNavigate()

  function handleAddInvestment() {
    navigate(getSectionPath(APP_SECTIONS.invest), {
      state: { fromSection: APP_SECTIONS.assets },
    })
  }

  function handleInvestmentSelect(investmentId: string) {
    navigate(getInvestmentDetailPath(investmentId), {
      state: { fromSection: APP_SECTIONS.assets },
    })
  }

  return (
    <AssetsScreen
      investments={investments}
      onAddInvestment={handleAddInvestment}
      onInvestmentSelect={handleInvestmentSelect}
    />
  )
}

function InvestRoute({
  addInvestment,
}: {
  addInvestment: (investment: Investment) => void
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const previousSection = getPreviousSectionFromLocation(
    location,
    APP_SECTIONS.dashboard,
  )

  function handleInvestmentCreate(investment: Investment) {
    addInvestment(investment)
    navigate(getInvestmentDetailPath(investment.id), {
      state: { fromSection: APP_SECTIONS.assets },
    })
  }

  function handleCancel() {
    navigate(getSectionPath(previousSection))
  }

  return (
    <InvestScreen
      onCancel={handleCancel}
      onInvestmentCreate={handleInvestmentCreate}
    />
  )
}

function InvestmentDetailRoute({
  deleteInvestment,
  investments,
}: {
  deleteInvestment: (investmentId: string) => void
  investments: Investment[]
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const { investmentId } = useParams()
  const previousSection = getPreviousSectionFromLocation(location)
  const selectedInvestment = investments.find((investment) => {
    return investment.id === investmentId
  })

  function handleBack() {
    navigate(getSectionPath(previousSection))
  }

  if (selectedInvestment === undefined) {
    return <InvestmentNotFound onBack={handleBack} />
  }

  const investment = selectedInvestment

  function handleDelete() {
    deleteInvestment(investment.id)
    navigate(getSectionPath(previousSection))
  }

  function handleEdit() {
    navigate(getInvestmentEditPath(investment.id), {
      state: { fromSection: previousSection },
    })
  }

  return (
    <InvestmentDetailScreen
      investment={investment}
      onBack={handleBack}
      onDelete={handleDelete}
      onEdit={handleEdit}
    />
  )
}

function EditInvestmentRoute({
  investments,
  updateInvestment,
}: {
  investments: Investment[]
  updateInvestment: (investment: Investment) => void
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const { investmentId } = useParams()
  const previousSection = getPreviousSectionFromLocation(location)
  const selectedInvestment = investments.find((investment) => {
    return investment.id === investmentId
  })

  function handleBack() {
    navigate(getSectionPath(previousSection))
  }

  if (selectedInvestment === undefined) {
    return <InvestmentNotFound onBack={handleBack} />
  }

  const investment = selectedInvestment

  function handleInvestmentUpdate(updatedInvestment: Investment) {
    updateInvestment(updatedInvestment)
    navigate(getInvestmentDetailPath(updatedInvestment.id), {
      state: { fromSection: previousSection },
    })
  }

  function handleCancel() {
    navigate(getInvestmentDetailPath(investment.id), {
      state: { fromSection: previousSection },
    })
  }

  return (
    <EditInvestmentScreen
      investment={investment}
      onCancel={handleCancel}
      onInvestmentUpdate={handleInvestmentUpdate}
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
