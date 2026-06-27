import {
  getActiveInvestmentCount,
  getPortfolioEstimatedAccruedReturn,
  getPortfolioEstimatedCurrentValue,
  getResolvedInvestmentSummary,
  resolveInvestment,
  type Investment,
} from "@/domain/investments"
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
  const asOfDate = new Date()
  const resolvedInvestments = investments.map((investment) =>
    resolveInvestment(investment, asOfDate),
  )
  const activeInvestments = getActiveInvestmentCount(resolvedInvestments)
  const earnedSoFar = getPortfolioEstimatedAccruedReturn(resolvedInvestments)
  const totalValue = getPortfolioEstimatedCurrentValue(resolvedInvestments)
  const earningsSnapshot = getPortfolioEarnedMoneySnapshot(
    investments,
    asOfDate,
  )
  const portfolioBreakdown = getPortfolioBreakdown(resolvedInvestments)
  const projectionPoints = getPortfolioProjectionPoints(investments, asOfDate)
  const projectionEarningPace = getPortfolioProjectionEarningPace(
    investments,
    asOfDate,
  )
  const maturityTimelineItems = getMaturityTimelineItems(
    resolvedInvestments,
    asOfDate,
  )
  const investmentSummaries = resolvedInvestments
    .map((investment) => getResolvedInvestmentSummary(investment))
    .slice(0, DASHBOARD_INVESTMENT_PREVIEW_LIMIT)

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
          <EarningsExplorationCard
            snapshot={earningsSnapshot}
            onOpenDetails={onOpenEarnings}
          />
          <PortfolioBreakdownCard
            breakdown={portfolioBreakdown}
            onOpenFilter={onOpenDistributionFilter}
          />
          <PortfolioProjectionChart
            earningPace={projectionEarningPace}
            points={projectionPoints}
            onOpenDetails={onOpenProjection}
          />
          <MaturityTimelineSection
            maturityTimelineItems={maturityTimelineItems}
            onInvestmentSelect={onInvestmentSelect}
          />
          <InvestmentPreviewList
            investments={investmentSummaries}
            totalInvestmentCount={investments.length}
            onInvestmentSelect={onInvestmentSelect}
          />
        </>
      )}
    </section>
  )
}
