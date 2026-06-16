# Trafin Domain Model

This document holds deeper domain-model detail than `project-plan.md`.

## Current MVP Model

The current implementation uses one flat investment record with enough data to power the MVP UI and calculations.

Current MVP fields:

- `id`
- `name`
- `institutionName`
- `type`
- `originalAmount`
- `annualRate`
- `currency`
- `paymentFrequency`
- `reinvestmentBehavior`
- `startDate`
- `endDate` for `fixed-term`
- `notes`
- `createdAt`
- `updatedAt`

## Current MVP Rules

- `name` must not be empty.
- `institutionName` must not be empty.
- `originalAmount > 0`.
- `annualRate >= 0`.
- `startDate` is required.
- `currency = MXN` in MVP.
- `paymentFrequency = at-maturity` is only valid for `fixed-term`.
- `fixed-term` requires `endDate`.
- `fixed-term` requires `endDate > startDate`.
- `open-ended` must not have `endDate`.

## Derived MVP Values

- `derivedStatus`
- `daysActive`
- `estimatedAccruedReturn`
- `estimatedCurrentValue`
- `estimatedPeriodicReturn`
- `projectedValueAtCustomDate`
- fixed-term-only progress and maturity values

## Long-Term Modeling Vision

The long-term direction is history-based rather than overwrite-based.

High-level idea:

- `Investment` is the full evolving asset and owns the dated records that describe its history.
- Time-varying behavior should come from dated records inside the investment.
- UI-friendly current state should be derived from history, not treated as the only source of truth.

The important history families currently in scope are:

- capital history
- rate history
- lifecycle history

## History Categories

### Capital History

Purpose:

- represent actual money added to an investment over time
- allow earnings to start from each capital addition's own date

Current direction:

- treat the original principal as the first capital entry in the long-term model
- treat later contributions as additional capital entries
- keep planned contributions separate from real contributions

Important distinction:

- contribution history answers how much raw capital the user has put into the investment
- that is different from the full value visible at a point in time, which also includes earned returns

### Rate History

Purpose:

- preserve earnings history when rates change over time

Current direction:

- use bounded rate periods instead of a single forever-stable rate
- split earnings calculations by overlapping capital timing and rate timing

### Lifecycle History

Purpose:

- support investments that change between `open-ended` and `fixed-term`
- preserve the dates when term behavior, maturity behavior, payout frequency, or reinvestment settings changed

Current direction:

- do not assume current type is immutable forever
- keep lifecycle changes as dated history rather than rewriting the investment record as if it had always looked that way

## Read Model Direction

The app will still need a simple current-state shape for screens such as Dashboard, Assets, and Investment Detail.

Important distinction:

- `Investment` is the source-of-truth history model.
- `ResolvedInvestment` is the current state of that investment as of one selected date.
- A resolved investment should be used for read/UI questions like sorting by current amount, filtering by current status, showing the active rate, or rendering cards.
- Raw `Investment` should be used when the operation needs the full historical record, such as persistence, editing history, replaying projections, or deriving a new resolved state.

That current-state view should eventually be a derived snapshot that answers questions like:

- what type is this investment right now?
- what rate is active right now?
- what invested amount is currently active?
- is it active or finished?
- what is the estimated current value?

The important rule is:

- the snapshot is a read model for UI and calculations
- the underlying dated history remains the source of truth

This should evolve from the current `ResolvedInvestment` style object rather than creating two competing "current state" concepts.

## MVP History-Based Direction

We are not replacing the current flat MVP storage shape immediately, but the domain direction is now clear:

- `Investment` becomes the full domain aggregate for one evolving asset.
- stable descriptive fields live directly on `Investment`
- capital changes are modeled as dated contribution records inside `Investment`
- rate changes are modeled as dated rate periods inside `Investment`
- lifecycle changes are modeled as dated lifecycle periods inside `Investment`
- UI-facing current state should be derived from those records

For MVP, this history model should stay intentionally constrained and simpler than the long-term vision.

### Investment Aggregate

`Investment` should represent the whole thing the user owns, not only an identity card.

It should hold stable descriptive fields plus the history records that explain how the investment changed over time.

Current direction:

- keep `id`
- keep `name`
- keep `institutionName`
- keep `currency`
- keep `notes`
- keep `createdAt`
- keep `updatedAt`

Meaning of dates:

- `createdAt` means when the record was created in the app
- operational start should come from the first lifecycle period, not from `createdAt`

Important source-of-truth rule:

- do not store direct mutable current fields like `annualRate`, `type`, `paymentFrequency`, `reinvestmentBehavior`, `originalAmount`, or `endDate` on `Investment` beside the histories
- those values should come from `ResolvedInvestment` for a specific date

### Contribution Records

Purpose:

- represent actual money added to an investment

Current direction:

- keep `id` on each contribution so individual entries can be referenced later
- require `amount > 0`
- require a valid contribution date
- do not add contribution `kind` yet in MVP

Future extension:

- `kind` can be added later if we need to distinguish things like initial funding, contributions, withdrawals, or manual adjustments

MVP rule:

- the earliest contribution acts as the initial principal

Naming update:

- use `currentInvestedAmount` for the resolved investment-level amount currently allocated to the investment
- use `totalContributedAmount` inside timeline segments when we mean cumulative contributed capital by the start of that segment

### Rate Periods

Purpose:

- represent which annual rate was active during which period

Current direction:

- keep `id` on each rate period so individual periods can be referenced later
- require `annualRate >= 0`
- use one bounded or open-ended period at a time
- do not allow overlapping rate periods for the same investment

MVP simplification:

- treat rate history as continuous
- if a new rate period starts, it replaces the previous active period at that boundary
- date-only precision is acceptable for MVP, even though richer time precision may be needed later

### Lifecycle Periods

Purpose:

- represent whether the investment is behaving as `open-ended` or `fixed-term` during a given period
- carry behavior-level fields such as payout frequency and reinvestment behavior

Current direction:

- keep `id` on each lifecycle period so individual periods can be referenced later
- keep `type`
- keep `paymentFrequency`
- keep `reinvestmentBehavior`
- keep `startDate`
- keep `endDate` when needed

MVP simplifications:

- do not add a separate `maturityDate` yet
- for MVP, `endDate` on a fixed-term lifecycle period also acts as its maturity boundary
- keep lifecycle periods continuous
- do not allow lifecycle overlaps
- do not allow lifecycle gaps in MVP

Important behavior rule:

- if an investment changes from `open-ended` to `fixed-term`, or the reverse, it remains the same investment with a new lifecycle period

## MVP Invariants

These are the constraints we currently want the implementation to follow.

### Shared Timeline Anchor

For MVP, the first important dates should align:

- first lifecycle `startDate`
- first contribution date
- first rate period `startDate`

MVP rule:

- those three dates must be the same

Why:

- it keeps earnings and status logic easier to validate
- it avoids ambiguous "investment existed but was not yet funded" cases in the first pass

### Contribution Invariants

- every contribution belongs to exactly one investment
- every contribution must have its own `id`
- the parent relationship comes from being nested inside `Investment`
- contribution `amount` must be positive
- contribution date must be a valid calendar date
- an investment must have at least one contribution in the history-based model
- contribution dates must not be before the first lifecycle period starts
- for MVP, contributions should happen only while lifecycle coverage exists

### Rate Period Invariants

- every rate period belongs to exactly one investment
- every rate period must have its own `id`
- the parent relationship comes from being nested inside `Investment`
- `annualRate >= 0`
- rate periods for the same investment must not overlap
- for MVP, rate periods should form one continuous timeline
- at any point in the MVP timeline, there should be at most one active rate period

### Lifecycle Period Invariants

- every lifecycle period belongs to exactly one investment
- every lifecycle period must have its own `id`
- the parent relationship comes from being nested inside `Investment`
- `type` must be `open-ended` or `fixed-term`
- `paymentFrequency = at-maturity` is valid only for `fixed-term`
- `fixed-term` requires `endDate`
- the currently active `open-ended` lifecycle period may omit `endDate`
- lifecycle periods for the same investment must not overlap
- for MVP, lifecycle periods must be continuous with no gaps
- at any point in the MVP timeline, there should be at most one active lifecycle period

## Derived Current State

The future `ResolvedInvestment` object should be the evolution of the current resolved investment model.

It acts like a snapshot of one `Investment` at a selected date.

For any date, the app should be able to answer:

- which lifecycle period is active?
- which rate period is active?
- what contributions have already happened?

From that, the current derived state can answer:

- investment identity fields such as name and institution
- current type
- current payment frequency
- current reinvestment behavior
- current annual rate
- current invested amount
- derived status
- estimated accrued return
- estimated current value

Important source-of-truth rule:

- `ResolvedInvestment` is computed from `Investment`
- it should not be persisted as the source of truth
- if the active rate period has `annualRate = 10` at a given date, then `ResolvedInvestment.annualRate` for that date is `10`

### Derived Current Invested Amount

For MVP:

- `currentInvestedAmount` at date `D` = sum of all contributions with date `<= D`

### Derived Current Value

For MVP:

- `estimatedCurrentValue = currentInvestedAmount + estimatedAccruedReturn`

### Derived Status

For MVP:

- `active` means there is an active lifecycle period covering the current date
- `finished` means the latest lifecycle period is fixed-term, its `endDate` is in the past, and no later lifecycle period replaced it

Non-MVP note:

- later, we may need a broader lifecycle/status discussion for cases like an open-ended investment that the user has exited or closed

## Timeline Segments

Timeline segments are the recommended foundation for derived calculations.

Idea:

- split one investment timeline into contiguous intervals where contributed capital, annual rate, and lifecycle behavior stay constant
- calculate returns from those stable intervals

Current direction:

- timeline segment `endDate` is exclusive in MVP
- a fixed-term investment earns up to, but not including, its `endDate`
- this keeps timeline behavior consistent across lifecycle types and simplifies segment composition

Suggested segment shape:

- `startDate`
- `endDate`
- `totalContributedAmount`
- `annualRate`
- `lifecycleType`
- `paymentFrequency`
- `reinvestmentBehavior`

Current interpretation:

- segment `totalContributedAmount` is the cumulative capital contributed and active at the start of the segment
- the structural segment does not yet include the propagated earning base

Calculated segment direction:

- a later calculated segment shape can extend the structural segment with fields such as `segmentStartingValue`
- when automatic reinvestment is modeled more fully, `segmentStartingValue` may exceed `totalContributedAmount` because prior earnings can roll forward into later segments

## Modeling Questions Still Open

- Should the first history implementation use narrow record types first, or a broader unified event model?
- When planned contributions arrive, how should reusable assumptions be stored separately from real balance history?
