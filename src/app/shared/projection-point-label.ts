/**
 * Describes a projection chart label without choosing a display language.
 * View-models produce this data; the chart translates it at the UI boundary.
 */
export type ProjectionPointLabel =
  | { kind: "today" }
  | { kind: "tomorrow" }
  | { kind: "target" }
  | {
      kind: "relative"
      unit: "day" | "week" | "month" | "year"
      value: number
    }
