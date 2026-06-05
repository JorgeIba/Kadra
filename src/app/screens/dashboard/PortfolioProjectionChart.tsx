import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
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
      <CardContent className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Projected value</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Estimated portfolio value over the next year using current simple
            interest assumptions.
          </p>
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={points}
              margin={{ bottom: 0, left: 0, right: 8, top: 8 }}
            >
              <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                width={72}
                tickFormatter={formatCompactMxn}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
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
                  borderRadius: "var(--radius-lg)",
                  color: "var(--card-foreground)",
                }}
              />
              <Line
                type="monotone"
                dataKey="estimatedValue"
                stroke="var(--primary)"
                strokeWidth={3}
                dot={{ fill: "var(--primary)", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function formatCompactMxn(value: number) {
  return `$${Math.round(value / 1000)}k`
}
