import {
  INVESTMENT_TYPE_LABELS,
  type InvestmentType,
} from "@/domain/investments"
import type { GroupIdentity } from "@/app/shared/grouping"

export function getInvestmentTypeGroup(type: InvestmentType): GroupIdentity {
  return {
    key: type,
    label: INVESTMENT_TYPE_LABELS[type],
  }
}
