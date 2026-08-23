import { describe, expect, it } from "vitest"
import { INVESTMENT_TYPES } from "@/domain/investments"
import { getInvestmentTypeGroup } from "@/app/shared/investment-type-grouping"

const investmentTypeLabels = {
  [INVESTMENT_TYPES.fixedTerm]: "Fixed term",
  [INVESTMENT_TYPES.openEnded]: "Open ended",
}

describe("investment type grouping", () => {
  it("returns a group identity for fixed-term investments", () => {
    expect(
      getInvestmentTypeGroup(INVESTMENT_TYPES.fixedTerm, investmentTypeLabels),
    ).toEqual({
      key: INVESTMENT_TYPES.fixedTerm,
      label: "Fixed term",
    })
  })

  it("returns a group identity for open-ended investments", () => {
    expect(
      getInvestmentTypeGroup(INVESTMENT_TYPES.openEnded, investmentTypeLabels),
    ).toEqual({
      key: INVESTMENT_TYPES.openEnded,
      label: "Open ended",
    })
  })
})
