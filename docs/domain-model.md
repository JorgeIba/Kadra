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

- `Investment` is the stable identity and descriptive container.
- Time-varying behavior should come from dated records.
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

That current-state view should eventually be a derived snapshot that answers questions like:

- what type is this investment right now?
- what rate is active right now?
- what principal is currently invested?
- is it active or finished?
- what is the estimated current value?

The important rule is:

- the snapshot is a read model for UI and calculations
- the underlying dated history remains the source of truth

## Modeling Questions Still Open

- Should the first history implementation use narrow record types first, or a broader unified event model?
- Should lifecycle history be a dedicated concept?
- Which fields belong to stable investment identity versus dated lifecycle history?
- When planned contributions arrive, how should reusable assumptions be stored separately from real balance history?
