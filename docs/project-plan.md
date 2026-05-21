# Trafin Project Plan

This document is the shared source of truth for explicit product and architecture decisions.

Related docs:

- [Engineering Guidelines](./engineering-guidelines.md)

## How We Use This File

- Only agreed decisions go into the `Agreed Decisions` sections.
- Anything still under discussion goes into `Open Questions`.
- The tracker is the high-level progress board for the project.
- When a decision changes, we update this file instead of letting assumptions drift in chat.

## Tracker

| Area | Status | Notes |
| --- | --- | --- |
| Product direction | In progress | Privacy-first, local-only PWA confirmed |
| V1 domain model | Mostly complete | MVP schema contract accepted; implementation types still pending |
| Financial rules | In progress | Fixed annual rate agreed for MVP; taxes deferred |
| Screen contracts | Mostly complete | MVP screens confirmed; detail screen added; Trends removed |
| Component tree | Mostly complete | MVP component responsibilities accepted |
| Persistence strategy | In progress | `localStorage` first; defensive storage adapter added |
| PWA strategy | Pending | Installable iPhone standalone app remains a goal |
| App shell | Mostly complete | Top bar and bottom nav confirmed |

## Final Goal

Build a privacy-first PWA for tracking fixed-income investments, primarily for Mexican users and MXN workflows, with all user data stored locally on-device and no required backend.

## Agreed Decisions

### Product Principles

- This project is both a real product and a frontend learning project.
- We do not want to rush into a fake V1 just to have screens quickly.
- We want to design the data model and abstractions before deeper UI implementation.
- We should store our explicit agreements in versioned docs so we can keep a running plan and status tracker.

### Product Scope Direction

- SOFIPOs and CETES are examples of investments, not separate app categories.
- An investment should be modeled generically enough to support things like institutions, personal loans, and other fixed-rate assets.
- For now, we are focusing on fixed-rate investments.
- For MVP, `rate` means annual rate.
- For MVP, investments start when they are created in the app.
- Taxes are out of scope for the current planning pass and should not drive the first data model.

### Core Investment Concept

Current shared understanding:

An investment is an asset you own that has capital allocated to it and may produce returns over time according to one or more payout/reinvestment rules.

### User-Provided Fields Currently Agreed

- Name
- Institution or counterparty
- Original amount
- Annual rate
- Payment frequency
- Reinvestment behavior
- Currency
- Start date
- End date / finish date

### Investment Type Model

- There is one generic `Investment` entity.
- MVP supports two investment types:
  - `fixed-term`
  - `open-ended`
- `fixed-term` and `open-ended` should be modeled as specialized variants of the same domain entity, not as unrelated entities.
- `endDate` is required for `fixed-term`.
- `endDate` is optional / absent for `open-ended`.
- Progress percentage only applies to investments with `endDate`.

### MVP Enum Decisions

- `paymentFrequency` should support:
  - `daily`
  - `weekly`
  - `monthly`
  - `at-maturity`
- `paymentFrequency = at-maturity` should only be valid for `fixed-term` investments.
- `institutionName` is enough for MVP; no extra institution typing is required yet.
- `reinvestmentBehavior` values for MVP:
  - `automatic`
  - `to-cash`

### Derived Status Rules

- `status` should be derived in MVP, not stored.
- Derived status values for MVP:
  - `active`
  - `finished`
- For `fixed-term`, `finished` is determined from `endDate` relative to the current date.
- For `open-ended`, investments are treated as `active` in MVP.

### Accepted MVP Investment Schema

#### Stored Fields

- `id`
  Stable unique identifier, system-generated.
- `name`
  Required user-provided investment name.
- `institutionName`
  Required user-provided institution, platform, or counterparty name.
- `type`
  Required enum: `fixed-term | open-ended`.
- `originalAmount`
  Required numeric amount initially committed to the investment.
- `annualRate`
  Required numeric annual rate for MVP.
- `currency`
  Required enum, MVP value: `MXN`.
- `paymentFrequency`
  Required enum: `daily | weekly | monthly | at-maturity`.
- `reinvestmentBehavior`
  Required enum: `automatic | to-cash`.
- `startDate`
  Required date, system-generated at creation time in MVP.
- `notes`
  Optional free-form notes.
- `createdAt`
  Required system-generated record creation timestamp.
- `updatedAt`
  Required system-generated record update timestamp.
- `endDate`
  Required only for `fixed-term`; absent for `open-ended`.

#### Derived Fields

- `derivedStatus`
  Enum: `active | finished`.
- `daysActive`
  Number of days since `startDate`.
- `estimatedAccruedReturn`
  Estimated accumulated return so far.
- `estimatedCurrentValue`
  Estimated current value, based on `originalAmount` plus accrued return.
- `estimatedPeriodicReturn`
  Estimated return aligned to `paymentFrequency`.
- `projectedValueAtCustomDate`
  Estimated value at an arbitrary future date.
- `totalTermDays`
  Fixed-term only.
- `daysRemaining`
  Fixed-term only.
- `progressPercentage`
  Fixed-term only, range `0..100`.
- `projectedValueAtEndDate`
  Fixed-term only.
- `projectedTotalReturnAtEndDate`
  Fixed-term only.

#### Domain Invariants

- `name` must not be empty.
- `institutionName` must not be empty.
- `originalAmount > 0`.
- `annualRate >= 0`.
- `startDate` is required.
- `currency = MXN` in MVP.
- `paymentFrequency = at-maturity` is only valid for `fixed-term`.
- `fixed-term` investments require `endDate`.
- `fixed-term` investments require `endDate > startDate`.
- `open-ended` investments must not have `endDate`.
- `open-ended` investments do not expose `progressPercentage`.

### Derived Data Currently Agreed

- Return at the end of a custom period
- Progress percentage for fixed-term investments only
- Estimated current value
- Other computed metrics derived from user-provided investment fields

### Accepted Screen Contracts Draft

The MVP app has four primary screens:

- `Dashboard`
- `Assets`
- `Invest`
- `InvestmentDetail`

Shared app shell:

- Top app bar with app logo and name.
- Bottom navigation with current route highlight.
- Empty-state support when there are no investments.
- PWA-safe layout for mobile-first use.
- A future profile entry may live in the top bar.

#### Dashboard Screen

Purpose:

Give the user a fast portfolio health snapshot.

Primary questions:

- How much do I have invested?
- How much am I earning now?
- How is the portfolio evolving?
- Which active investments deserve attention?

Domain inputs:

- Estimated current value.
- Estimated daily return.
- Investment summaries for the list.

User actions:

- Open full assets list.
- Open add investment flow.
- Open investment detail.
- Navigate to another tab.

States:

- Empty portfolio.
- Populated portfolio.
- Offline-ready state later.

Product note:

Dashboard should show a summary card with total value and estimated daily cash flow, plus an investment list using investment summary cards.

#### Invest Screen

Purpose:

Create one investment record with enough information to compute projections immediately.

Primary questions:

- What kind of investment am I adding?
- What are its return and payout rules?
- What is the estimated outcome?

User inputs:

- `name`
- `institutionName`
- `type`
- `originalAmount`
- `annualRate`
- `paymentFrequency`
- `reinvestmentBehavior`
- `currency`
- `endDate` for `fixed-term`
- `notes`

System-filled values:

- `id`
- `startDate`
- `createdAt`
- `updatedAt`

Domain inputs:

- Allowed enum values.
- Domain validation rules.
- Live preview calculator outputs.

User actions:

- Switch between `fixed-term` and `open-ended`.
- Enter investment fields.
- See live derived preview.
- Save investment.
- Cancel or go back.

States:

- Pristine.
- Invalid with validation messages.
- Valid with live preview.
- Saved/submitting later.

Product note:

The form should adapt by investment type. `fixed-term` shows `endDate`; `open-ended` hides it and should not expose progress or maturity-only concepts.

#### Assets Screen

Purpose:

Browse, filter, and inspect the portfolio as a collection of investment records.

Primary questions:

- What investments do I currently have?
- Which ones are active or finished?
- Which one should I review, edit, or manage?

Domain inputs:

- Full investment list.
- Derived status per investment.
- Active holdings summary.
- Per-investment preview fields:
  - name
  - institution name
  - type
  - original amount
  - annual rate
  - payment frequency
  - reinvestment behavior
  - next relevant date when available
  - derived status
  - progress for fixed-term investments

User actions:

- Filter by `active` or `finished`.
- Filter by `fixed-term` or `open-ended`.
- Sort by amount, rate, end date, or newest.
- Open investment detail later.
- Edit investment later.
- Finish/close an open-ended investment later.

States:

- Empty portfolio.
- Active-only populated.
- Mixed active and finished investments.
- Filtered no-results.

Product note:

Assets is the operational list view. It should be more dense and scannable than Dashboard.

MVP decision:

Assets starts as a clean full list without filters or sorting. Filters can be added later.

#### Investment Detail Screen

Purpose:

Inspect one investment in detail.

Primary questions:

- What are the exact terms of this investment?
- What has it accrued so far?
- What is its expected outcome?
- Is it active or finished?

Domain inputs:

- One investment by `id`.
- Derived status.
- Estimated current value.
- Estimated accrued return.
- Estimated periodic return.
- Fixed-term values when applicable:
  - total term days
  - days remaining
  - progress percentage
  - projected value at end date
  - projected total return at end date

User actions:

- Go back to the previous screen.
- Edit investment later.
- Delete investment later.
- Finish/close an open-ended investment later.

States:

- Investment found.
- Investment missing.

Product note:

MVP includes a dedicated detail screen, but destructive actions can wait until the core read/detail flow works.

MVP decision:

Investment detail is reachable by tapping an investment card, not through bottom navigation.

#### Trends Screen

Purpose:

Post-MVP analytics and projections.

MVP decision:

Trends is removed from MVP navigation for now. We can reintroduce it later once dashboard, CRUD, and detail flows are working.

### MVP Component Responsibilities

#### App Shell

- `AppShell`
  Owns the mobile-first layout and renders top bar, active screen, and bottom nav.
- `TopBar`
  Shows app logo and app name. May later include profile/settings.
- `BottomNav`
  Moves between `Dashboard`, `Assets`, and `Invest`.

#### Dashboard

- `DashboardScreen`
  Coordinates dashboard data and actions.
- `PortfolioSummaryCard`
  Shows total value and estimated daily cash flow.
- `InvestmentList`
  Renders a short preview of investment summary cards on Dashboard.
- `InvestmentSummaryCard`
  Shows one investment summary and opens detail.

#### Assets

- `AssetsScreen`
  Coordinates the full investment list and navigation to detail.
- `InvestmentList`
  Reused from dashboard, with full-list behavior on Assets.
- `InvestmentSummaryCard`
  Reused card for each investment. MVP fields are `name`, `institutionName`, `originalAmount`, `annualRate`, `type`, `estimatedCurrentValue`, and fixed-term `progressPercentage`.

#### Invest

- `InvestScreen`
  Hosts the new investment form.
- `InvestmentForm`
  Owns create-investment form fields and validation.
- `ProjectionPreview`
  Shows live calculated preview from the current form draft.

#### Investment Detail

- `InvestmentDetailScreen`
  Shows full details for one investment.
- `InvestmentMetrics`
  Shows derived values for that investment.
- `InvestmentTerms`
  Shows raw stored fields in a readable way.
- `FixedTermProgress`
  Shows progress only for fixed-term investments.

## Proposed Build Order

This sequence is currently recommended and can be adjusted as we agree.

1. Lock product assumptions and domain vocabulary.
2. Define the V1 data model.
3. Define pure financial calculations from that model.
4. Define screen contracts for dashboard, form, and management flows.
5. Define component composition.
6. Build the app shell.
7. Implement persistence.
8. Implement dashboard and form.
9. Add management flows.
10. Revisit Trends and landing page if still needed.

## Open Questions

- Should we use `docs/` only, or also add a separate `plans/` directory later for execution checklists?
- Do we want a true marketing landing page, or just an internal app shell and dashboard empty state?
- Do payouts happen into cash balance, or are they just conceptual unless reinvestment is enabled?
- Do we need separate concepts for `principal`, `current balance`, and `accumulated unpaid returns`?
- Should personal loans and institutional products share the exact same schema in V1?
- Do we want `notes` in MVP or can it wait?
- Should `estimatedPeriodicReturn` stay in the first calculator pass or wait until screen contracts make it necessary?

## Future Nice-To-Haves

- Manual adjustments such as top-ups and partial withdrawals
- User-editable investment start dates, including validation that fixed-term `endDate` is after `startDate`
- More detailed payout schedule anchoring, such as weekly-on-Tuesday or monthly-on-specific-day
- Support for investment transitions between `open-ended` and `fixed-term` over time
- Richer lifecycle or configuration history for investments

## Architecture Considerations

- App routing files live under `src/app/routing/` to keep router, route-derived active-section logic, and bottom-nav route config together.
- `routing/navigation.ts` may need a further split if route helpers and bottom-nav configuration keep growing.
- Dashboard and Assets both render investment summary cards. Consider a shared investment list component if their list behavior stays similar.
- Dashboard should remain a preview experience, while Assets should remain the full operational list.
- `InvestmentFormPreview` can stay local while it is placeholder-only. Move it to shared investment components once it renders real projection data from an investment draft.
- Storage currently persists the same plain-string shape used by the runtime domain model. If runtime models later use `Date` objects or diverge from persisted records, add explicit `recordToInvestment` / `investmentToRecord` mappers instead of relying on raw `JSON.parse`.
- Before adding more silent fallback paths, define a small app logging policy or logger wrapper so storage/schema failures can be reported consistently without random `console.warn` calls across the codebase.

## Next Recommended Step

Start implementation:

- replace scaffold UI with the Trafin app shell
- implement initial domain types and sample data
- implement the first static screens before persistence
