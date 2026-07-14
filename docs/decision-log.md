# Kadra Decision Log

This document captures dated decisions and planning restructures so `project-plan.md` can stay focused on the current story.

## 2026-07-13

### Local portfolio backups

Decision:

- Export complete investment histories to a versioned Kadra JSON file.
- Restore validates the file before replacing the current local portfolio.
- Keep the file local and exclude device-specific UI preferences from v1.

Why:

- iOS Home Screen web apps need reinstallation to reliably receive updated
  install metadata such as their icon and launch image.
- A user-controlled file makes that reinstall recoverable without weakening
  Kadra's local-only, no-account product direction.

### Native Apple PWA launch images

Decision:

- Use device-specific Apple startup images for the modern iPhone 14–17
  viewport profiles, built from the centered Kadra lockup.
- Do not add an app-owned splash screen or intentional delay after the app is
  ready to render.

Why:

- The startup artwork gives installed iPhone and iPad PWAs a coherent native
  launch surface without turning a fast application into a fake loading state.
- The focused profile set preserves the intended dark field, mark, wordmark,
  and layout across current iPhone orientations without carrying every legacy
  iPhone and iPad asset.

### Kadra identity selected

Decision:

- Use Kadra as the product name.
- Use the Kadra Angle mark: a mint vertical ledger stem and a rising four-point
  diagonal with a flat base.
- Use Elms Sans Regular for the lowercase `kadra` wordmark.
- Use the horizontal mark-left lockup as the primary lockup and the centered,
  stacked lockup for launch screens.
- Use `#060D0C` as the identity field and `#9BD8C2` as the mark color.
- Keep this decision separate from the product UI type system: Georgia remains
  for financial values and Geist remains for UI text.

Why:

- The mark is simple and recognizable at app-icon sizes without relying on
  financial clichés.
- Elms gives the identity a calm, modern, personal voice while preserving the
  seriousness needed for a private investment tool.
- Separating identity decisions from the runtime rollout prevents a half-renamed
  PWA with mismatched icons, metadata, and typography.

## 2026-06-10

### Planning docs restructure

Decision:

- Keep `docs/project-plan.md` as the top-level source of truth for current direction, roadmap, and open questions.
- Move deeper domain detail into `docs/domain-model.md`.
- Move dated planning changes into `docs/decision-log.md`.
- Move parked ideas and future work into `docs/backlog.md`.

Why:

- The previous `project-plan.md` was carrying vision, roadmap, old execution notes, detailed specs, and historical context all at once.
- That made the document harder to trust as a living source of truth.

### Investment modeling direction

Decision:

- Replace the current flat MVP investment record with a history-based `Investment` model as the next domain direction.
- Treat `Investment` as the full evolving asset, not only a stable identity record.
- Store contribution, rate, and lifecycle histories inside `Investment`.
- Use `ResolvedInvestment` as the date-specific snapshot computed from those histories.

Why:

- Real investments can change through contributions, rate updates, and lifecycle transitions.
- A purely mutable current-state record cannot explain historical earnings cleanly.
- Keeping histories inside `Investment` matches the product language: the investment is the whole thing the user owns, while current rate, type, principal, and value are derived at a specific date.

## 2026-06-15

### Investment vs. ResolvedInvestment boundary

Decision:

- Use `Investment` for the persisted source-of-truth history.
- Use `ResolvedInvestment` for current/as-of-date read state.
- Resolve investments at screen or orchestration boundaries when a flow needs current-state UI helpers.
- Pass `ResolvedInvestment` into helpers that only answer current-state questions, such as filtering, sorting, breakdowns, summaries, and maturity timelines.

Why:

- It avoids replaying the same investment history repeatedly inside small UI helpers.
- It makes function signatures describe the real question being answered.
- It keeps raw history operations separate from current-state presentation logic.

## 2026-06-20

### Event histories as the main domain backbone

Decision:

- Treat contribution events, rate events, and lifecycle events as the persistent source of truth for changing investment behavior.
- Derive periods, terms timelines, balance timelines, projections, and current read models from those event histories.
- Keep lifecycle periods as derived calculation views instead of a separately persisted lifecycle-state concept.

Why:

- It gives the domain one clearer calculation backbone.
- It reduces fragile intermediate states across projections, previews, and screen helpers.
- It keeps persisted history small while letting calculations express richer date-based behavior.

### App-level recovery for render failures

Decision:

- Wrap the app in a global error boundary so unexpected render failures degrade gracefully instead of crashing the whole experience without context.

Why:

- The product is local-first, so preserving user trust during bad states matters.
- A friendly recovery path is safer while the investment model and flows are still evolving.

## 2026-06-22

### Edit vs. record-change workflow split

Decision:

- Keep investment edit focused on correcting the latest stored facts.
- Use a separate record-change flow to append new dated contribution, rate, or lifecycle events.
- Keep the first record-change flow append-only by requiring the effective date to be on or after the latest stored event date.

Why:

- Editing and recording mean different things in a history-based model.
- The split makes user intent clearer and avoids silently rewriting the past when the user meant to add new history.
- The append-only MVP rule gives safer behavior until backdated insertion and richer event-history management are deliberately designed.
