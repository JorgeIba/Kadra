import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { DashboardSectionHeader } from "@/app/screens/dashboard/DashboardSectionHeader"
import type { PortfolioProjectionPoint } from "@/app/screens/dashboard/portfolio-projection"
import { Card, CardContent } from "@/components/ui/card"
import { formatMxn } from "@/lib/formatters"

interface PortfolioProjectionChartProps {
  points: PortfolioProjectionPoint[]
}

export function PortfolioProjectionChart({
  points,
}: PortfolioProjectionChartProps) {
  return (
    <Card className="rounded-lg">
      <CardContent className="space-y-5">
        <DashboardSectionHeader
          title="Growth forecast"
          description="Estimated projection based on yield."
        />

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={points}
              margin={{ bottom: 0, left: 0, right: 8, top: 28 }}
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
              <YAxis hide domain={["dataMin", "dataMax"]} />
              <Tooltip
                formatter={(value) => {
                  return [formatMxn(Number(value)), "Estimated value"]
                }}
                labelFormatter={(label) => {
                  const point = points.find((projectionPoint) => {
                    return projectionPoint.label === label
                  })

                  return point === undefined ? String(label) : point.date
                }}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--card-foreground)",
                }}
              />
              <Line
                type="monotone"
                dataKey="estimatedValue"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ fill: "var(--primary)", r: 2 }}
                activeDot={{ fill: "var(--primary)", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
