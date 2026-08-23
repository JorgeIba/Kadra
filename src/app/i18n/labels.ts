import type { TFunction } from "i18next"
import type { ProjectionPointLabel } from "@/app/shared/projection-point-label"
import {
  CURRENCIES,
  DERIVED_STATUSES,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
  REINVESTMENT_STRATEGIES,
  type Currency,
  type DerivedStatus,
  type InvestmentType,
  type PaymentFrequency,
  type ReinvestmentBehavior,
  type ReinvestmentStrategy,
} from "@/domain/investments"

/** Builds the localized labels for stable investment values. */
export function getCurrencyLabels(
  t: TFunction,
): Readonly<Record<Currency, string>> {
  return {
    [CURRENCIES.mxn]: t("common.currencies.mxn"),
  }
}

export function getDerivedStatusLabels(
  t: TFunction,
): Readonly<Record<DerivedStatus, string>> {
  return {
    [DERIVED_STATUSES.active]: t("common.status.active"),
    [DERIVED_STATUSES.finished]: t("common.status.finished"),
  }
}

export function getInvestmentTypeLabels(
  t: TFunction,
): Readonly<Record<InvestmentType, string>> {
  return {
    [INVESTMENT_TYPES.fixedTerm]: t("common.investmentTypes.fixedTerm"),
    [INVESTMENT_TYPES.openEnded]: t("common.investmentTypes.openEnded"),
  }
}

export function getPaymentFrequencyLabels(
  t: TFunction,
): Readonly<Record<PaymentFrequency, string>> {
  return {
    [PAYMENT_FREQUENCIES.atMaturity]: t("common.paymentFrequencies.atMaturity"),
    [PAYMENT_FREQUENCIES.daily]: t("common.paymentFrequencies.daily"),
    [PAYMENT_FREQUENCIES.monthly]: t("common.paymentFrequencies.monthly"),
    [PAYMENT_FREQUENCIES.weekly]: t("common.paymentFrequencies.weekly"),
  }
}

export function getReinvestmentBehaviorLabels(
  t: TFunction,
): Readonly<Record<ReinvestmentBehavior, string>> {
  return {
    [REINVESTMENT_BEHAVIORS.automatic]: t(
      "common.reinvestmentBehaviors.automatic",
    ),
    [REINVESTMENT_BEHAVIORS.toCash]: t("common.reinvestmentBehaviors.toCash"),
  }
}

export function getReinvestmentStrategyOptionLabels(
  t: TFunction,
): Readonly<Record<ReinvestmentStrategy, string>> {
  return {
    [REINVESTMENT_STRATEGIES.keepAsCash]: t(
      "projection.maturityScenario.options.keepAsCash.label",
    ),
    [REINVESTMENT_STRATEGIES.reinvest]: t(
      "projection.maturityScenario.options.reinvest.label",
    ),
    [REINVESTMENT_STRATEGIES.strict]: t(
      "projection.maturityScenario.options.strict.label",
    ),
  }
}

export function getProjectionPointLabelText(
  t: TFunction,
  label: ProjectionPointLabel,
): string {
  switch (label.kind) {
    case "today":
      return t("projection.summary.today")
    case "tomorrow":
      return t("projection.summary.tomorrow")
    case "target":
      return t("projection.summary.target")
    case "relative":
      switch (label.unit) {
        case "day":
          return t("projection.chart.pointLabels.relative.days", {
            count: label.value,
          })
        case "week":
          return t("projection.chart.pointLabels.relative.weeks", {
            count: label.value,
          })
        case "month":
          return t("projection.chart.pointLabels.relative.months", {
            count: label.value,
          })
        case "year":
          return t("projection.chart.pointLabels.relative.years", {
            count: label.value,
          })
      }
  }
}
