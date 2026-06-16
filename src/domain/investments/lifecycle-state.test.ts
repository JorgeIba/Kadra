import { describe, expect, it } from "vitest"
import { DERIVED_STATUSES } from "@/domain/investments/constants"
import {
  fixedInvestment,
  openEndedInvestment,
} from "@/domain/investments/investment-test-fixtures"
import {
  getDerivedStatus,
  getLastActiveDateForInvestment,
  getLatestLifecyclePeriod,
  getTimelineEndDateForInvestment,
} from "@/domain/investments/lifecycle-state"

describe("investment lifecycle state", () => {
  it("keeps fixed-term investments active before the end date and finished on the end date", () => {
    expect(
      getDerivedStatus(fixedInvestment, new Date("2026-01-30T12:00:00.000Z")),
    ).toBe(DERIVED_STATUSES.active)
    expect(
      getDerivedStatus(fixedInvestment, new Date("2026-01-31T12:00:00.000Z")),
    ).toBe(DERIVED_STATUSES.finished)
  })

  it("keeps open-ended investments active while their lifecycle is still open", () => {
    expect(
      getDerivedStatus(
        openEndedInvestment,
        new Date("2027-01-01T12:00:00.000Z"),
      ),
    ).toBe(DERIVED_STATUSES.active)
  })

  it("uses the requested date while a lifecycle period is active", () => {
    expect(getLastActiveDateForInvestment(fixedInvestment, "2026-01-16")).toBe(
      "2026-01-16",
    )
  })

  it("uses the last earning date for a finished fixed-term investment", () => {
    expect(getLastActiveDateForInvestment(fixedInvestment, "2026-02-15")).toBe(
      "2026-01-30",
    )
  })

  it("keeps the fixed-term end boundary for timeline calculations", () => {
    expect(getTimelineEndDateForInvestment(fixedInvestment, "2026-02-15")).toBe(
      "2026-01-31",
    )
  })

  it("finds the latest lifecycle period", () => {
    expect(getLatestLifecyclePeriod(fixedInvestment)?.id).toBe(
      "lifecycle-period-1",
    )
  })
})
