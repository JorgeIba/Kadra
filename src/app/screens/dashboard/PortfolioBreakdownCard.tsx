import type {
  PortfolioBreakdown,
  PortfolioBreakdownItem,
} from "@/app/screens/dashboard/portfolio-breakdown"
import {
  ASSET_FILTER_OPTIONS,
  type AssetFilterOption,
} from "@/app/screens/assets/assets-filtering"
import {
  AnimatedProgressBar,
  type ProgressTone,
} from "@/app/components/AnimatedProgressBar"
import { MoneyAmount } from "@/app/components/MoneyAmount"
import { Button } from "@/components/ui/button"
import { DashboardSectionHeader } from "@/app/screens/dashboard/DashboardSectionHeader"
import { getInvestmentTypeLabels } from "@/app/i18n/labels"
import { formatPercentage } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"
import { INVESTMENT_TYPES, type InvestmentType } from "@/domain/investments"

interface PortfolioBreakdownCardProps {
  breakdown: PortfolioBreakdown
  onOpenFilter: (filterOption: AssetFilterOption) => void
}

export function PortfolioBreakdownCard({
  breakdown,
  onOpenFilter,
}: PortfolioBreakdownCardProps) {
  const { t } = useTranslation()

  return (
    <section className="space-y-6 border-y border-border/70 py-5">
      <DashboardSectionHeader
        title={t("dashboard.breakdown.activeCapital")}
        description={t("dashboard.breakdown.description")}
      />

      <BreakdownSection
        items={breakdown.activeCapitalByType}
        onOpenFilter={onOpenFilter}
      />
    </section>
  )
}

function BreakdownSection({
  items,
  onOpenFilter,
}: {
  items: PortfolioBreakdownItem[]
  onOpenFilter: (filterOption: AssetFilterOption) => void
}) {
  const { t } = useTranslation()

  if (items.length === 0) {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        {t("dashboard.breakdown.empty")}
      </p>
    )
  }

  return (
    <div className="space-y-5">
      {items.map((item) => (
        <BreakdownRow key={item.type} item={item} onOpenFilter={onOpenFilter} />
      ))}
    </div>
  )
}

function BreakdownRow({
  item,
  onOpenFilter,
}: {
  item: PortfolioBreakdownItem
  onOpenFilter: (filterOption: AssetFilterOption) => void
}) {
  const { t } = useTranslation()
  const investmentTypeLabels = getInvestmentTypeLabels(t)
  const tone = getBreakdownTone(item.type)
  const filterOption = getBreakdownFilterOption(item.type)
  const translatedItemLabel = investmentTypeLabels[item.type]

  return (
    <Button
      type="button"
      variant="ghost"
      className="-mx-3 h-auto w-[calc(100%+1.5rem)] justify-start rounded-lg border border-transparent px-3 py-3 text-left hover:border-primary/10 hover:bg-secondary/35 active:border-primary/10 active:bg-secondary/50"
      onClick={() => onOpenFilter(filterOption)}
    >
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={cn("size-2 rounded-full", getToneDotClassName(tone))}
                aria-hidden="true"
              />
              <p className="font-ledger text-base text-foreground">
                {translatedItemLabel}
              </p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("common.counts.investment", { count: item.count })}
            </p>
          </div>
          <div className="text-right">
            <p className="font-ledger text-sm font-bold text-foreground tabular-nums">
              <MoneyAmount value={item.estimatedValue} />
            </p>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(item.percentage, {
                maximumFractionDigits: 0,
              })}{" "}
              {t("dashboard.breakdown.ofActiveValue")}
            </p>
          </div>
        </div>
        <AnimatedProgressBar tone={tone} value={item.percentage} />
      </div>
    </Button>
  )
}

function getBreakdownFilterOption(itemType: InvestmentType): AssetFilterOption {
  return itemType === INVESTMENT_TYPES.openEnded
    ? ASSET_FILTER_OPTIONS.openEnded
    : ASSET_FILTER_OPTIONS.fixedTerm
}

function getBreakdownTone(itemType: InvestmentType): ProgressTone {
  return itemType === INVESTMENT_TYPES.openEnded ? "info" : "warning"
}

const TONE_DOT_CLASS_NAMES: Record<ProgressTone, string> = {
  info: "bg-info",
  neutral: "bg-status-neutral",
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
}

function getToneDotClassName(tone: ProgressTone) {
  return TONE_DOT_CLASS_NAMES[tone]
}
