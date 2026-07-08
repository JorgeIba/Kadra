import { describe, expect, it } from "vitest"
import { INVESTMENT_TYPE_LABELS, INVESTMENT_TYPES } from "@/domain/investments"
import { getInvestmentTypeGroup } from "@/app/shared/investment-type-grouping"

describe("investment type grouping", () => {
  it("returns a group identity for fixed-term investments", () => {
    expect(getInvestmentTypeGroup(INVESTMENT_TYPES.fixedTerm)).toEqual({
      key: INVESTMENT_TYPES.fixedTerm,
      label: INVESTMENT_TYPE_LABELS[INVESTMENT_TYPES.fixedTerm],
    })
  })

  it("returns a group identity for open-ended investments", () => {
    expect(getInvestmentTypeGroup(INVESTMENT_TYPES.openEnded)).toEqual({
      key: INVESTMENT_TYPES.openEnded,
      label: INVESTMENT_TYPE_LABELS[INVESTMENT_TYPES.openEnded],
    })
  })
})
