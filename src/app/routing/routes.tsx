import { useLocation, useParams } from "react-router"
import { InvestmentNotFound } from "@/app/components/InvestmentNotFound"
import { useInvestments } from "@/app/context/investments-context"
import { getPreviousSectionFromLocation } from "@/app/routing/active-section"
import { useAnimatedNavigate } from "@/app/routing/navigation-animation"
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
import type { Investment } from "@/domain/investments"

export function DashboardRoute() {
  const { investments } = useInvestments()
  const navigate = useAnimatedNavigate()

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

  function handleOpenDistributionFilter(filterOption: AssetFilterOption) {
    navigate(getSectionPath(APP_SECTIONS.assets), {
      state: {
        fromSection: APP_SECTIONS.dashboard,
        selectedAssetFilter: filterOption,
      },
    })
  }

  function handleOpenEarnings() {
    navigate(getEarningsPath(), {
      state: { fromSection: APP_SECTIONS.dashboard },
    })
  }

  function handleOpenProjection() {
    navigate(getProjectionPath(), {
      state: { fromSection: APP_SECTIONS.dashboard },
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
  const navigate = useAnimatedNavigate()
  const location = useLocation()
  const selectedAssetFilter = (
    location.state as { selectedAssetFilter?: AssetFilterOption } | null
  )?.selectedAssetFilter

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
      initialFilterOption={selectedAssetFilter}
      investments={investments}
      onAddInvestment={handleAddInvestment}
      onInvestmentSelect={handleInvestmentSelect}
    />
  )
}

export function InvestRoute() {
  const { addInvestment } = useInvestments()
  const navigate = useAnimatedNavigate()
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

export function EarningsRoute() {
  const { investments } = useInvestments()
  const navigate = useAnimatedNavigate()
  const location = useLocation()
  const previousSection = getPreviousSectionFromLocation(
    location,
    APP_SECTIONS.dashboard,
  )

  function handleBack() {
    navigate(getSectionPath(previousSection))
  }

  return <EarningsScreen investments={investments} onBack={handleBack} />
}

export function ProjectionRoute() {
  const { investments } = useInvestments()
  const navigate = useAnimatedNavigate()
  const location = useLocation()
  const previousSection = getPreviousSectionFromLocation(
    location,
    APP_SECTIONS.dashboard,
  )

  function handleBack() {
    navigate(getSectionPath(previousSection))
  }

  return <ProjectionScreen investments={investments} onBack={handleBack} />
}

export function InvestmentDetailRoute() {
  const { investments, deleteInvestment } = useInvestments()
  const navigate = useAnimatedNavigate()
  const location = useLocation()
  const { investmentId } = useParams()
  const previousSection = getPreviousSectionFromLocation(location)
  const investment = investments.find((currentInvestment) => {
    return currentInvestment.id === investmentId
  })

  function handleBack() {
    navigate(getSectionPath(previousSection))
  }

  if (investment === undefined) {
    return <InvestmentNotFound onBack={handleBack} />
  }

  const selectedInvestment = investment

  function handleDelete() {
    deleteInvestment(selectedInvestment.id)
    navigate(getSectionPath(previousSection))
  }

  function handleEdit() {
    navigate(getInvestmentEditPath(selectedInvestment.id), {
      state: { fromSection: previousSection },
    })
  }

  function handleRecordChange() {
    navigate(getInvestmentRecordChangePath(selectedInvestment.id), {
      state: { fromSection: previousSection },
    })
  }

  return (
    <InvestmentDetailScreen
      investment={selectedInvestment}
      onBack={handleBack}
      onDelete={handleDelete}
      onEdit={handleEdit}
      onRecordChange={handleRecordChange}
    />
  )
}

export function EditInvestmentRoute() {
  const { investments, updateInvestment } = useInvestments()
  const navigate = useAnimatedNavigate()
  const location = useLocation()
  const { investmentId } = useParams()
  const previousSection = getPreviousSectionFromLocation(location)
  const investment = investments.find((currentInvestment) => {
    return currentInvestment.id === investmentId
  })

  function handleBack() {
    navigate(getSectionPath(previousSection))
  }

  if (investment === undefined) {
    return <InvestmentNotFound onBack={handleBack} />
  }

  const selectedInvestment = investment

  function handleInvestmentUpdate(updatedInvestment: Investment) {
    updateInvestment(updatedInvestment)
    navigate(getInvestmentDetailPath(updatedInvestment.id), {
      state: { fromSection: previousSection },
    })
  }

  function handleCancel() {
    navigate(getInvestmentDetailPath(selectedInvestment.id), {
      state: { fromSection: previousSection },
    })
  }

  return (
    <EditInvestmentScreen
      investment={selectedInvestment}
      onCancel={handleCancel}
      onInvestmentUpdate={handleInvestmentUpdate}
    />
  )
}

export function RecordChangeRoute() {
  const { investments, updateInvestment } = useInvestments()
  const navigate = useAnimatedNavigate()
  const location = useLocation()
  const { investmentId } = useParams()
  const previousSection = getPreviousSectionFromLocation(location)
  const investment = investments.find((currentInvestment) => {
    return currentInvestment.id === investmentId
  })

  function handleBack() {
    navigate(getSectionPath(previousSection))
  }

  if (investment === undefined) {
    return <InvestmentNotFound onBack={handleBack} />
  }

  const selectedInvestment = investment

  function handleInvestmentUpdate(updatedInvestment: Investment) {
    updateInvestment(updatedInvestment)
    navigate(getInvestmentDetailPath(updatedInvestment.id), {
      state: { fromSection: previousSection },
    })
  }

  function handleCancel() {
    navigate(getInvestmentDetailPath(selectedInvestment.id), {
      state: { fromSection: previousSection },
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
