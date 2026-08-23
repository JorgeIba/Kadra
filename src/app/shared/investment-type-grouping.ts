import type { InvestmentType } from "@/domain/investments"
import type { GroupIdentity } from "@/app/shared/grouping"

export function getInvestmentTypeGroup(
  type: InvestmentType,
  labels: Readonly<Record<InvestmentType, string>>,
): GroupIdentity {
  return {
    key: type,
    label: labels[type],
  }
}
