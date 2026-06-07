import {
  getInvestmentSummary,
  getPortfolioEstimatedCurrentValue,
  getPortfolioEstimatedDailyReturn,
  type Investment,
} from "@/domain/investments"
import { EmptyInvestmentsState } from "@/app/components/investments/EmptyInvestmentsState"
import { InvestmentPreviewList } from "@/app/screens/dashboard/InvestmentPreviewList"
import { getMaturityTimelineItems } from "@/app/screens/dashboard/maturity-timeline"
import { MaturityTimelineSection } from "@/app/screens/dashboard/MaturityTimelineSection"
import { getPortfolioBreakdown } from "@/app/screens/dashboard/portfolio-breakdown"
import { PortfolioBreakdownCard } from "@/app/screens/dashboard/PortfolioBreakdownCard"
import { getPortfolioProjectionPoints } from "@/app/screens/dashboard/portfolio-projection"
import { PortfolioProjectionChart } from "@/app/screens/dashboard/PortfolioProjectionChart"
import { PortfolioSummaryCard } from "@/app/screens/dashboard/PortfolioSummaryCard"

interface DashboardScreenProps {
  investments: Investment[]
  onAddInvestment: () => void
  onInvestmentSelect: (investmentId: string) => void
}

const DASHBOARD_INVESTMENT_PREVIEW_LIMIT = 3

export function DashboardScreen({
  investments,
  onAddInvestment,
  onInvestmentSelect,
}: DashboardScreenProps) {
  const asOfDate = new Date()
  const totalValue = getPortfolioEstimatedCurrentValue(investments, asOfDate)
  const dailyCashFlow = getPortfolioEstimatedDailyReturn(investments)
  const portfolioBreakdown = getPortfolioBreakdown(investments, asOfDate)
  const projectionPoints = getPortfolioProjectionPoints(investments, asOfDate)
  const maturityTimelineItems = getMaturityTimelineItems(investments, asOfDate)
  const investmentSummaries = investments
    .map((investment) => getInvestmentSummary(investment, asOfDate))
    .slice(0, DASHBOARD_INVESTMENT_PREVIEW_LIMIT)

  return (
    <section className="space-y-9">
      <PortfolioSummaryCard
        totalValue={totalValue}
        dailyCashFlow={dailyCashFlow}
        investmentCount={investments.length}
      />

      {investments.length === 0 ? (
        <EmptyInvestmentsState
          title="No investments yet"
          description="Add your first investment to start tracking total value, daily cash flow, and projected returns."
          actionLabel="Add investment"
          onAction={onAddInvestment}
        />
      ) : (
        <>
          <PortfolioBreakdownCard breakdown={portfolioBreakdown} />
          <PortfolioProjectionChart points={projectionPoints} />
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
