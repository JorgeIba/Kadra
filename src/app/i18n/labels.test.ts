import { describe, expect, it } from "vitest"
import {
  getDerivedStatusLabels,
  getProjectionPointLabelText,
} from "@/app/i18n/labels"
import { i18n } from "@/app/i18n/i18n"
import { LOCALES } from "@/app/i18n/locales"
import { DERIVED_STATUSES } from "@/domain/investments"

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

  it("pluralizes localized list, active asset, and maturity counts", () => {
    const englishT = i18n.getFixedT(LOCALES.englishUS)
    const spanishT = i18n.getFixedT(LOCALES.spanishMX)

    expect(englishT("assets.list.count", { count: 1 })).toBe("1 shown")
    expect(englishT("assets.list.count", { count: 2 })).toBe("2 shown")
    expect(spanishT("assets.list.count", { count: 1 })).toBe("1 mostrada")
    expect(spanishT("assets.list.count", { count: 2 })).toBe("2 mostradas")

    expect(englishT("dashboard.activeAssets.activeCount", { count: 1 })).toBe(
      "1 active",
    )
    expect(spanishT("dashboard.activeAssets.activeCount", { count: 2 })).toBe(
      "2 activas",
    )

    expect(englishT("dashboard.maturities.inDays", { count: 1 })).toBe(
      "In 1 day",
    )
    expect(spanishT("dashboard.maturities.inDays", { count: 2 })).toBe(
      "En 2 días",
    )
  })

  it("keeps individual status labels singular in Spanish", () => {
    const t = i18n.getFixedT(LOCALES.spanishMX)
    const labels = getDerivedStatusLabels(t)

    expect(labels[DERIVED_STATUSES.active]).toBe("Activa")
    expect(labels[DERIVED_STATUSES.finished]).toBe("Terminada")
    expect(t("common.status.activePlural")).toBe("Activas")
    expect(t("common.status.finishedPlural")).toBe("Terminadas")
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
