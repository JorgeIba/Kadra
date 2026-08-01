import { Fragment, useMemo, type ReactNode } from "react"
import {
  DERIVED_STATUSES,
  getActiveInvestmentCount,
  getPortfolioEstimatedAccruedReturn,
  getPortfolioEstimatedCurrentValue,
  getResolvedInvestmentSummary,
  resolveInvestment,
  type Investment,
} from "@/domain/investments"
import {
  DASHBOARD_PANEL_KEYS,
  getDashboardMaturityPriority,
  getDashboardPanelOrder,
  type DashboardPanelKey,
} from "@/app/screens/dashboard/dashboard-panel-order"
import { EarningsExplorationCard } from "@/app/screens/dashboard/EarningsExplorationCard"
import { EmptyInvestmentsState } from "@/app/components/investments/EmptyInvestmentsState"
import { InvestmentPreviewList } from "@/app/screens/dashboard/InvestmentPreviewList"
import type { AssetFilterOption } from "@/app/screens/assets/assets-filtering"
import { getMaturityTimelineItems } from "@/app/screens/dashboard/maturity-timeline"
import { MaturityTimelineSection } from "@/app/screens/dashboard/MaturityTimelineSection"
import { getPortfolioBreakdown } from "@/app/screens/dashboard/portfolio-breakdown"
import { PortfolioBreakdownCard } from "@/app/screens/dashboard/PortfolioBreakdownCard"
import {
  getPortfolioProjectionEarningPace,
  getPortfolioProjectionPoints,
} from "@/app/screens/dashboard/portfolio-projection"
import { PortfolioProjectionChart } from "@/app/screens/dashboard/PortfolioProjectionChart"
import { PortfolioSummaryCard } from "@/app/screens/dashboard/PortfolioSummaryCard"
import { getPortfolioEarnedMoneySnapshot } from "@/app/screens/earnings/earnings-view-model"

interface DashboardScreenProps {
  investments: Investment[]
  onAddInvestment: () => void
  onOpenDistributionFilter: (filterOption: AssetFilterOption) => void
  onOpenEarnings: () => void
  onOpenProjection: () => void
  onInvestmentSelect: (investmentId: string) => void
}

const DASHBOARD_INVESTMENT_PREVIEW_LIMIT = 3

export function DashboardScreen({
  investments,
  onAddInvestment,
  onOpenDistributionFilter,
  onOpenEarnings,
  onOpenProjection,
  onInvestmentSelect,
}: DashboardScreenProps) {
  const asOfDate = useMemo(() => new Date(), [])
  const resolvedInvestments = investments.map((investment) =>
    resolveInvestment(investment, asOfDate),
  )
  const activeInvestments = getActiveInvestmentCount(resolvedInvestments)
  const activeResolvedInvestments = resolvedInvestments.filter((investment) => {
    return investment.derivedStatus === DERIVED_STATUSES.active
  })
  const earnedSoFar = getPortfolioEstimatedAccruedReturn(resolvedInvestments)
  const totalValue = getPortfolioEstimatedCurrentValue(resolvedInvestments)
  const earningsSnapshot = getPortfolioEarnedMoneySnapshot(
    investments,
    asOfDate,
  )
  const portfolioBreakdown = getPortfolioBreakdown(resolvedInvestments)
  const projectionPoints = useMemo(
    () => getPortfolioProjectionPoints(investments, asOfDate),
    [asOfDate, investments],
  )
  const projectionEarningPace = getPortfolioProjectionEarningPace(
    investments,
    asOfDate,
  )
  const maturityTimelineItems = getMaturityTimelineItems(
    resolvedInvestments,
    asOfDate,
  )
  const panelOrder = getDashboardPanelOrder(
    getDashboardMaturityPriority(maturityTimelineItems),
  )
  const investmentSummaries = activeResolvedInvestments
    .map((investment) => getResolvedInvestmentSummary(investment))
    .slice(0, DASHBOARD_INVESTMENT_PREVIEW_LIMIT)
  const dashboardPanels = {
    [DASHBOARD_PANEL_KEYS.earnings]: (
      <EarningsExplorationCard
        snapshot={earningsSnapshot}
        onOpenDetails={onOpenEarnings}
      />
    ),
    [DASHBOARD_PANEL_KEYS.projection]: (
      <PortfolioProjectionChart
        earningPace={projectionEarningPace}
        points={projectionPoints}
        onOpenDetails={onOpenProjection}
      />
    ),
    [DASHBOARD_PANEL_KEYS.activeCapital]: (
      <PortfolioBreakdownCard
        breakdown={portfolioBreakdown}
        onOpenFilter={onOpenDistributionFilter}
      />
    ),
    [DASHBOARD_PANEL_KEYS.maturities]: (
      <MaturityTimelineSection
        maturityTimelineItems={maturityTimelineItems}
        onInvestmentSelect={onInvestmentSelect}
      />
    ),
    [DASHBOARD_PANEL_KEYS.activeAssets]: (
      <InvestmentPreviewList
        investments={investmentSummaries}
        activeInvestmentCount={activeResolvedInvestments.length}
        onInvestmentSelect={onInvestmentSelect}
      />
    ),
  } satisfies Record<DashboardPanelKey, ReactNode>

  return (
    <section className="space-y-9">
      <PortfolioSummaryCard
        activeInvestments={activeInvestments}
        earnedSoFar={earnedSoFar}
        totalValue={totalValue}
      />

      {investments.length === 0 ? (
        <EmptyInvestmentsState
          title="No investments yet"
          description="Add your first investment to start tracking total value, estimated earnings, and projected returns."
          actionLabel="Add investment"
          onAction={onAddInvestment}
        />
      ) : (
        <>
          {panelOrder.map((panelKey) => {
            return (
              <Fragment key={panelKey}>{dashboardPanels[panelKey]}</Fragment>
            )
          })}
        </>
      )}
    </section>
  )
}
