import { ScreenIntro } from "@/app/components/ScreenIntro"

export function InvestmentNotFound() {
  return (
    <section className="space-y-3">
      <ScreenIntro
        eyebrow="Investment"
        title="Not found"
        description="This investment is no longer available in your local portfolio."
      />
    </section>
  )
}
