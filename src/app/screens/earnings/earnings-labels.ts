import type { TFunction } from "i18next"
import {
  EARNED_MONEY_SORT_OPTIONS,
  type EarnedMoneySortOption,
} from "@/app/screens/earnings/earnings-view-model"

export function getEarnedMoneySortOptionLabels(
  t: TFunction,
): Readonly<Record<EarnedMoneySortOption, string>> {
  return {
    [EARNED_MONEY_SORT_OPTIONS.highestEarned]: t(
      "earnings.sortOptions.highestEarned",
    ),
    [EARNED_MONEY_SORT_OPTIONS.lowestEarned]: t(
      "earnings.sortOptions.lowestEarned",
    ),
    [EARNED_MONEY_SORT_OPTIONS.name]: t("earnings.sortOptions.name"),
    [EARNED_MONEY_SORT_OPTIONS.status]: t("earnings.sortOptions.status", {
      status: t("common.status.active").toLowerCase(),
    }),
  }
}
