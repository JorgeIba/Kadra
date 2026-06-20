# Trafin Domain Model

This document holds deeper domain-model detail than `project-plan.md`.

## Current Direction

Trafin models one investment as an event-sourced history plus derived read
models.

Core distinction:

- `Investment` is the source of truth and is safe to persist.
- User-entered historical facts are stored as events.
- Periods are derived internal calculation views, not persisted state.
- Terms timeline segments compose the derived views into stable intervals.
- `ResolvedInvestment` is the UI/read model for one investment as of a selected date.

This lets one investment evolve over time without rewriting its past. For
example, an investment can receive more money, change rate, move from
`open-ended` to `fixed-term`, then later become `open-ended` again.

## Investment Aggregate

`Investment` represents the whole evolving asset.

Stable fields live directly on the investment:

- `id`
- `name`
- `institutionName`
- `currency`
- `notes`
- `createdAt`
- `updatedAt`

Event histories live inside the investment:

- `contributionEvents`
- `rateEvents`
- `lifecycleEvents`

Source-of-truth rule:

- do not store mutable current fields like `annualRate`, `type`,
  `paymentFrequency`, `reinvestmentBehavior`, `originalAmount`, or `endDate`
  directly on `Investment`
- those values come from resolving the investment for a specific date

Meaning of dates:

- `createdAt` means when the record was created in Trafin
- event `effectiveDate` means when that fact became true in the investment world
- UI labels may still say "start date", "contribution date", or "maturity date"
  when that wording is clearer for users

## Event Histories

Events are single facts at a date. They are what we persist and edit.

### Contribution Events

Purpose:

- represent actual money added to an investment
- let the app distinguish contributed capital from earned return

Shape:

- `id`
- `amount`
- `effectiveDate`
- `notes`
- `createdAt`

Rules:

- `amount > 0`
- an investment must have at least one contribution event
- the earliest contribution acts as the initial principal for MVP

Future extension:

- add a `kind` only when we need withdrawals, manual adjustments, or other
  contribution-like facts

### Rate Events

Purpose:

- represent the annual rate that became true on a date
- preserve earnings history when rates change over time

Shape:

- `id`
- `annualRate`
- `effectiveDate`
- `createdAt`

Rules:

- `annualRate >= 0`
- an investment must have at least one rate event

### Lifecycle Events

Purpose:

- represent lifecycle behavior that became true on a date
- support transitions between `open-ended` and `fixed-term`
- carry payout frequency and reinvestment behavior

Common fields:

- `id`
- `type`
- `paymentFrequency`
- `reinvestmentBehavior`
- `effectiveDate`
- `createdAt`

Fixed-term lifecycle events also require:

- `maturityDate`

Rules:

- `type` must be `open-ended` or `fixed-term`
- `fixed-term` requires `maturityDate > effectiveDate`
- `open-ended` must not include `maturityDate`
- an investment must have at least one lifecycle event

## Derived Internal Views

Derived views are calculation helpers. They should not be persisted or treated as
the main public API for UI features.

### Rate Period

Derived from `rateEvents`.

Shape:

- `startDate`
- `endDate | null`
- `annualRate`

Interpretation:

- `[startDate, endDate)` means inclusive start and exclusive end
- `endDate = null` means open-ended
- a later rate event closes the previous derived rate period
- same-day zero-length derived periods are skipped deterministically

### Lifecycle Period

Derived from `lifecycleEvents`.

Shape:

- `startDate`
- `endDate | null`
- lifecycle behavior fields
- optional `maturityDate` for fixed-term periods

Interpretation:

- `[startDate, endDate)` means inclusive start and exclusive end
- `endDate = null` means open-ended
- a later lifecycle event closes or replaces the previous derived lifecycle
  period
- a fixed-term lifecycle period ends at the earlier of its `maturityDate` or the
  next lifecycle event
- deleting later lifecycle events naturally re-expands the previous open-ended
  event into an open-ended derived period

### Contribution State

Derived from `contributionEvents` at a date.

Minimum shape:

- `totalContributedAmount`

Interpretation:

- `totalContributedAmount` is cumulative contributed capital with
  `effectiveDate <= date`
- it does not include earned return

## Terms Timeline

A segment is one date interval. A timeline is the ordered list of those
segments.

The terms timeline is the backbone for derived calculations.

It splits one investment history into contiguous terms segments where
contribution state, active rate period, and active lifecycle period stay stable.

Current terms segment shape:

- `startDate`
- `endDate`
- `contributionState`
- `ratePeriod`
- `lifecyclePeriod`

Rules:

- segments use `[startDate, endDate)` semantics
- `endDate = null` means the current open-ended segment continues beyond the
  query date
- segment boundaries come from contribution event dates, rate event dates,
  lifecycle event dates, fixed-term maturity dates, and the selected `asOfDate`
- zero elapsed time still produces the current segment
- terms segments compose derived views instead of flattening every field
  directly onto the segment

## Balance Timeline

The balance timeline is the ordered list of balance segments.

A balance segment extends one terms segment with money calculations.

It adds fields such as:

- `startingBalance`
- `interestEarned`
- `endingBalance`

Important distinction:

- `totalContributedAmount` answers "how much raw capital has the user added?"
- `startingBalance` answers "how much money is working at the start of this
  segment?"
- with automatic reinvestment, `startingBalance` may include prior earned return

## Investment Calculation Context And Balance State

`InvestmentCalculationContext` is the lightweight as-of-date context used to
build calculations.

It contains date boundaries and `termsSegments`, the ordered terms segments from
the investment start through `timelineEndDate`.

`InvestmentBalanceState` extends that context with money results, such as the
balance timeline, current balance segment, estimated accrued return, and
estimated current value.

State date fields use `CalendarDateString` so there is one domain date
representation in the returned object:

- `requestedDate` is the calendar date the caller asked about
- `timelineEndDate` is the exclusive boundary used to build the terms and
  balance timelines

For active investments, `requestedDate` and `timelineEndDate` usually match.
For finished fixed-term investments, `timelineEndDate` snaps back to the
investment end boundary so calculations do not continue past maturity.

## Resolved Investment

`ResolvedInvestment` is the read model for UI and portfolio queries.

It is computed from one raw `Investment` and one selected date.

Use it for questions like:

- what type is this investment right now?
- what rate is active right now?
- what lifecycle status is active right now?
- how much money has been contributed?
- how much has been earned?
- what is the estimated current value?
- should this investment appear in a current dashboard, asset list, or portfolio
  calculation?

Rules:

- `ResolvedInvestment` should not be persisted as source truth
- portfolio calculations should generally depend on resolved investments because
  portfolio value is inherently date-dependent
- raw `Investment` should be used for persistence, editing history, and deriving
  a new resolved state

## Open Questions

- How should the UI distinguish "fix this existing event" from "add a new event
  on top of history"?
- When planned contributions arrive, how should assumptions be stored separately
  from real contribution events?
