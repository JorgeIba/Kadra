import { useLocation, useNavigate, useParams } from "react-router"
import { InvestmentNotFound } from "@/app/components/InvestmentNotFound"
import { useInvestments } from "@/app/context/investments-context"
import { getActiveNavSectionFromLocation } from "@/app/routing/active-section"
import { useBackOrFallbackNavigation } from "@/app/routing/useBackOrFallbackNavigation"
import {
  APP_SECTIONS,
  getEarningsPath,
  getInvestmentDetailPath,
  getInvestmentEditPath,
  getInvestmentRecordChangePath,
  getProjectionPath,
  getSectionPath,
} from "@/app/routing/navigation"
import { AssetsScreen } from "@/app/screens/assets/AssetsScreen"
import type { AssetFilterOption } from "@/app/screens/assets/assets-filtering"
import { DashboardScreen } from "@/app/screens/dashboard/DashboardScreen"
import { EarningsScreen } from "@/app/screens/earnings/EarningsScreen"
import { EditInvestmentScreen } from "@/app/screens/edit-investment/EditInvestmentScreen"
import { InvestScreen } from "@/app/screens/invest/InvestScreen"
import { InvestmentDetailScreen } from "@/app/screens/investment-detail/InvestmentDetailScreen"
import { ProjectionScreen } from "@/app/screens/projection/ProjectionScreen"
import { RecordChangeScreen } from "@/app/screens/record-change/RecordChangeScreen"
import { getInstitutionSuggestions } from "@/app/shared/institution-grouping"
import type { Investment } from "@/domain/investments"

export function DashboardRoute() {
  const { investments } = useInvestments()
  const navigate = useNavigate()

  function handleAddInvestment() {
    navigate(getSectionPath(APP_SECTIONS.invest), {
      state: { activeNavSection: APP_SECTIONS.dashboard },
    })
  }

  function handleInvestmentSelect(investmentId: string) {
    navigate(getInvestmentDetailPath(investmentId), {
      state: { activeNavSection: APP_SECTIONS.dashboard },
    })
  }

  function handleOpenDistributionFilter(filterOption: AssetFilterOption) {
    navigate(getSectionPath(APP_SECTIONS.assets), {
      state: {
        activeNavSection: APP_SECTIONS.dashboard,
        selectedAssetFilter: filterOption,
      },
    })
  }

  function handleOpenEarnings() {
    navigate(getEarningsPath(), {
      state: { activeNavSection: APP_SECTIONS.dashboard },
    })
  }

  function handleOpenProjection() {
    navigate(getProjectionPath(), {
      state: { activeNavSection: APP_SECTIONS.dashboard },
    })
  }

  return (
    <DashboardScreen
      investments={investments}
      onAddInvestment={handleAddInvestment}
      onInvestmentSelect={handleInvestmentSelect}
      onOpenDistributionFilter={handleOpenDistributionFilter}
      onOpenEarnings={handleOpenEarnings}
      onOpenProjection={handleOpenProjection}
    />
  )
}

export function AssetsRoute() {
  const { investments } = useInvestments()
  const navigate = useNavigate()
  const location = useLocation()
  const selectedAssetFilter = (
    location.state as { selectedAssetFilter?: AssetFilterOption } | null
  )?.selectedAssetFilter

  function handleAddInvestment() {
    navigate(getSectionPath(APP_SECTIONS.invest), {
      state: { activeNavSection: APP_SECTIONS.assets },
    })
  }

  function handleInvestmentSelect(investmentId: string) {
    navigate(getInvestmentDetailPath(investmentId), {
      state: { activeNavSection: APP_SECTIONS.assets },
    })
  }

  return (
    <AssetsScreen
      initialFilterOption={selectedAssetFilter}
      investments={investments}
      onAddInvestment={handleAddInvestment}
      onInvestmentSelect={handleInvestmentSelect}
    />
  )
}

export function InvestRoute() {
  const { addInvestment, investments } = useInvestments()
  const navigate = useNavigate()
  const location = useLocation()
  const activeNavSection = getActiveNavSectionFromLocation(
    location,
    APP_SECTIONS.dashboard,
  )

  function handleInvestmentCreate(investment: Investment) {
    addInvestment(investment)
    navigate(getInvestmentDetailPath(investment.id), {
      state: { activeNavSection: APP_SECTIONS.assets },
    })
  }

  function handleCancel() {
    navigate(getSectionPath(activeNavSection))
  }

  return (
    <InvestScreen
      institutionSuggestions={getInstitutionSuggestions(investments)}
      onCancel={handleCancel}
      onInvestmentCreate={handleInvestmentCreate}
    />
  )
}

export function EarningsRoute() {
  const { investments } = useInvestments()
  const navigate = useNavigate()
  const location = useLocation()
  const activeNavSection = getActiveNavSectionFromLocation(
    location,
    APP_SECTIONS.dashboard,
  )

  function handleInvestmentSelect(investmentId: string) {
    navigate(getInvestmentDetailPath(investmentId), {
      state: { activeNavSection },
    })
  }

  return (
    <EarningsScreen
      investments={investments}
      onInvestmentSelect={handleInvestmentSelect}
    />
  )
}

export function ProjectionRoute() {
  const { investments } = useInvestments()
  const navigate = useNavigate()
  const location = useLocation()
  const activeNavSection = getActiveNavSectionFromLocation(
    location,
    APP_SECTIONS.dashboard,
  )

  function handleInvestmentSelect(investmentId: string) {
    navigate(getInvestmentDetailPath(investmentId), {
      state: { activeNavSection },
    })
  }

  return (
    <ProjectionScreen
      investments={investments}
      onInvestmentSelect={handleInvestmentSelect}
    />
  )
}

export function InvestmentDetailRoute() {
  const { investments, deleteInvestment } = useInvestments()
  const navigate = useNavigate()
  const navigateBackOrFallback = useBackOrFallbackNavigation()
  const location = useLocation()
  const { investmentId } = useParams()
  const activeNavSection = getActiveNavSectionFromLocation(location)
  const updateAcknowledgement = (
    location.state as {
      updateAcknowledgement?: "recorded-change" | "updated-terms"
    } | null
  )?.updateAcknowledgement
  const investment = investments.find((currentInvestment) => {
    return currentInvestment.id === investmentId
  })

  if (investment === undefined) {
    return <InvestmentNotFound />
  }

  const selectedInvestment = investment

  function handleDelete() {
    deleteInvestment(selectedInvestment.id)
    navigateBackOrFallback(getSectionPath(activeNavSection))
  }

  function handleEdit() {
    navigate(getInvestmentEditPath(selectedInvestment.id), {
      state: { activeNavSection },
    })
  }

  function handleRecordChange() {
    navigate(getInvestmentRecordChangePath(selectedInvestment.id), {
      state: { activeNavSection },
    })
  }

  return (
    <InvestmentDetailScreen
      investment={selectedInvestment}
      onDelete={handleDelete}
      onEdit={handleEdit}
      onRecordChange={handleRecordChange}
      updateAcknowledgement={updateAcknowledgement}
    />
  )
}

export function EditInvestmentRoute() {
  const { investments, updateInvestment } = useInvestments()
  const navigate = useNavigate()
  const navigateBackOrFallback = useBackOrFallbackNavigation()
  const location = useLocation()
  const { investmentId } = useParams()
  const activeNavSection = getActiveNavSectionFromLocation(location)
  const investment = investments.find((currentInvestment) => {
    return currentInvestment.id === investmentId
  })

  if (investment === undefined) {
    return <InvestmentNotFound />
  }

  const selectedInvestment = investment

  function handleInvestmentUpdate(updatedInvestment: Investment) {
    updateInvestment(updatedInvestment)
    navigate(getInvestmentDetailPath(updatedInvestment.id), {
      replace: true,
      state: { activeNavSection, updateAcknowledgement: "updated-terms" },
    })
  }

  function handleCancel() {
    navigateBackOrFallback(getInvestmentDetailPath(selectedInvestment.id), {
      state: { activeNavSection },
    })
  }

  return (
    <EditInvestmentScreen
      institutionSuggestions={getInstitutionSuggestions(investments)}
      investment={selectedInvestment}
      onCancel={handleCancel}
      onInvestmentUpdate={handleInvestmentUpdate}
    />
  )
}

export function RecordChangeRoute() {
  const { investments, updateInvestment } = useInvestments()
  const navigate = useNavigate()
  const navigateBackOrFallback = useBackOrFallbackNavigation()
  const location = useLocation()
  const { investmentId } = useParams()
  const activeNavSection = getActiveNavSectionFromLocation(location)
  const investment = investments.find((currentInvestment) => {
    return currentInvestment.id === investmentId
  })

  if (investment === undefined) {
    return <InvestmentNotFound />
  }

  const selectedInvestment = investment

  function handleInvestmentUpdate(updatedInvestment: Investment) {
    updateInvestment(updatedInvestment)
    navigate(getInvestmentDetailPath(updatedInvestment.id), {
      replace: true,
      state: { activeNavSection, updateAcknowledgement: "recorded-change" },
    })
  }

  function handleCancel() {
    navigateBackOrFallback(getInvestmentDetailPath(selectedInvestment.id), {
      state: { activeNavSection },
    })
  }

  return (
    <RecordChangeScreen
      investment={selectedInvestment}
      onCancel={handleCancel}
      onInvestmentUpdate={handleInvestmentUpdate}
    />
  )
}
