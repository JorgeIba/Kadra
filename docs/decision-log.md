# Trafin Decision Log

This document captures dated decisions and planning restructures so `project-plan.md` can stay focused on the current story.

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
