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

- Keep the current flat MVP investment record for near-term product work.
- Move long-term thinking toward a history-based model where investment state is derived from dated changes over time.

Why:

- Real investments can change through contributions, rate updates, and lifecycle transitions.
- A purely mutable current-state record cannot explain historical earnings cleanly.
