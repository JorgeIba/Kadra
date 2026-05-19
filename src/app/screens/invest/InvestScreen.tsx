import { InvestmentForm } from "@/app/screens/invest/InvestmentForm"

export function InvestScreen() {
  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Invest</p>
        <h1 className="text-3xl font-semibold tracking-normal">
          New investment
        </h1>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          Capture the investment terms first. We will wire validation, live
          projections, and saving in the next pass.
        </p>
      </div>

      <InvestmentForm />
    </section>
  )
}
