import { useReducedMotion } from "motion/react"
import {
  CartesianGrid,
  Line,
  LineDrawShape,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type LineDrawShapeProps,
} from "recharts"
import { MoneyAmount } from "@/app/components/MoneyAmount"
import { useMoneyPrivacy } from "@/app/context/money-privacy-context"
import { useShouldAnimateRouteEntry } from "@/app/routing/navigation-animation"
import { formatDisplayDate } from "@/lib/formatters"
import { cn } from "@/lib/utils"

export interface PortfolioProjectionLineChartPoint {
  date: string
  label: string
  estimatedValue: number
  projectedEarnings: number
}

interface PortfolioProjectionLineChartProps {
  className?: string
  points: PortfolioProjectionLineChartPoint[]
}

interface ProjectionTooltipProps {
  active?: boolean
  payload?: Array<{ payload?: PortfolioProjectionLineChartPoint }>
}

/**
 * POP navigation should render the first line immediately, but later data
 * revisions should still use Recharts' normal point interpolation. Recharts
 * exposes that distinction through `isEntrance`; removing only the entrance
 * stroke reveal keeps the data-update animation intact.
 */
function StaticPopEntryLineShape(props: LineDrawShapeProps) {
  return (
    <LineDrawShape
      {...props}
      visibleLength={props.isEntrance ? null : props.visibleLength}
    />
  )
}

export function PortfolioProjectionLineChart({
  className,
  points,
}: PortfolioProjectionLineChartProps) {
  const prefersReducedMotion = useReducedMotion() ?? false
  const shouldAnimateRouteEntry = useShouldAnimateRouteEntry()
  const { isMoneyHidden } = useMoneyPrivacy()
  const shouldAnimateChart = !prefersReducedMotion

  return (
    <div className={cn("h-56", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={points}
          margin={{ bottom: 0, left: 0, right: 8, top: 24 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="var(--border)"
            strokeOpacity={0.45}
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            dy={14}
          />
          <YAxis
            width={54}
            domain={["dataMin", "dataMax"]}
            tickCount={3}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            tickFormatter={(value) => formatCompactMxn(value, isMoneyHidden)}
          />
          <Tooltip content={<ProjectionTooltip />} />
          <Line
            type="monotone"
            dataKey="estimatedValue"
            isAnimationActive={shouldAnimateChart}
            animationDuration={360}
            animationEasing="ease-out"
            shape={
              shouldAnimateRouteEntry ? undefined : StaticPopEntryLineShape
            }
            stroke="var(--primary)"
            strokeWidth={2}
            dot={{ fill: "var(--primary)", r: 2 }}
            activeDot={{ fill: "var(--primary)", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function formatCompactMxn(value: number, isMoneyHidden: boolean) {
  if (isMoneyHidden) {
    return "$•••"
  }

  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }

  if (Math.abs(value) >= 1_000) {
    return `$${Math.round(value / 1_000)}k`
  }

  return `$${Math.round(value)}`
}

function ProjectionTooltip({ active, payload }: ProjectionTooltipProps) {
  const point = payload?.[0]?.payload

  if (active !== true || point === undefined) {
    return null
  }

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-card-foreground shadow-none">
      <p className="text-xs text-muted-foreground">
        {formatDisplayDate(point.date)}
      </p>
      <p className="mt-2 text-sm font-medium text-foreground">
        <MoneyAmount value={point.estimatedValue} />
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Projected earnings <MoneyAmount value={point.projectedEarnings} />
      </p>
    </div>
  )
}
