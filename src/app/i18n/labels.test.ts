import { describe, expect, it } from "vitest"
import { getProjectionPointLabelText } from "@/app/i18n/labels"
import { i18n } from "@/app/i18n/i18n"
import { LOCALES } from "@/app/i18n/locales"

describe("localized plural labels", () => {
  it("selects singular and plural English investment labels", () => {
    const t = i18n.getFixedT(LOCALES.englishUS)

    expect(t("common.counts.investment", { count: 1 })).toBe("1 investment")
    expect(t("common.counts.investment", { count: 2 })).toBe("2 investments")
  })

  it("selects singular and plural Spanish investment labels", () => {
    const t = i18n.getFixedT(LOCALES.spanishMX)

    expect(t("common.counts.investment", { count: 1 })).toBe("1 inversión")
    expect(t("common.counts.investment", { count: 2 })).toBe("2 inversiones")
  })

  it("localizes relative projection labels with their count", () => {
    const t = i18n.getFixedT(LOCALES.spanishMX)

    expect(
      getProjectionPointLabelText(t, {
        kind: "relative",
        unit: "month",
        value: 1,
      }),
    ).toBe("1 mes")
    expect(
      getProjectionPointLabelText(t, {
        kind: "relative",
        unit: "month",
        value: 2,
      }),
    ).toBe("2 meses")
  })
})
