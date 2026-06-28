import { ScreenIntro } from "@/app/components/ScreenIntro"

interface InvestmentNotFoundProps {
  onBack: () => void
}

export function InvestmentNotFound({ onBack }: InvestmentNotFoundProps) {
  return (
    <section className="space-y-3">
      <ScreenIntro
        eyebrow="Investment"
        title="Not found"
        description="This investment is no longer available in your local portfolio."
      />
      <button
        type="button"
        className="text-sm font-medium text-primary"
        onClick={onBack}
      >
        Back to list
      </button>
    </section>
  )
}
