# Kadra Project Plan

This document is the top-level source of truth for current project direction, agreed decisions, roadmap ordering, and active open questions.

Supporting docs:

- [Domain Model](./domain-model.md)
- [Decision Log](./decision-log.md)
- [Backlog](./backlog.md)
- [Engineering Guidelines](./engineering-guidelines.md)
- [Design Guidelines](./design-guidelines.md)
- [Brand Identity](./brand/README.md)
- [Product Context](../PRODUCT.md)
- [Design System](../DESIGN.md)

## How We Use This File

- Keep this file high level.
- Record only current direction and decisions we still stand behind.
- Move detailed modeling to [Domain Model](./domain-model.md).
- Move dated changes of mind to [Decision Log](./decision-log.md).
- Move parked ideas and future work to [Backlog](./backlog.md).

## Current Status

| Area | Status | Notes |
| --- | --- | --- |
| Product direction | Active | Privacy-first, local-only PWA remains the core direction |
| Domain direction | Active | Event-history investments and resolved read models are now the working product model |
| MVP app foundation | In progress | App shell, persistence, dashboard, assets, invest, detail, earnings, edit, and record-change flows are already underway in code |
| Planning structure | Updated | `project-plan.md` is now the high-level hub with linked supporting docs |
| Brand identity | Applied | Kadra name, Kadra Angle mark, Elms Sans wordmark, browser metadata, PWA metadata, production icons, and native Apple launch images are aligned |

## Vision

Build a privacy-first PWA for tracking fixed-income investments, primarily for Mexican users and MXN workflows, with all user data stored locally on-device and no required backend.

The product should help users understand:

- how much they have invested
- what their investments are estimated to earn
- how each investment evolves over time
- which investments deserve attention now

## Agreed Direction

### Product Principles

- This project is both a real product and a frontend learning project.
- We do not want to rush into a fake V1 just to get screens quickly.
- We want explicit decisions written down so the product and architecture do not drift across chats.
- We should favor models that stay understandable as the product grows.

### Product Scope

- SOFIPOs, CETES, personal loans, and similar fixed-income assets should fit under one generic investment concept.
- The app is focused on fixed-rate investments first.
- Taxes are out of scope for the current planning pass.
- `MXN` is the only required MVP currency for now.

### Investment Vision

- `Investment` is the full persisted asset record and stable identity.
- Investments can change over time.
- The app should preserve that history instead of rewriting the past.
- The latest state shown in the UI is derived from dated history.
- Important change families include capital changes, rate changes, and lifecycle changes such as moving between `open-ended` and `fixed-term`.

### MVP Working Model

- MVP persists investments as event histories with contribution, rate, and lifecycle events.
- `ResolvedInvestment` is the main read model for current-date UI and portfolio calculations.
- MVP supports `fixed-term` and `open-ended` investments.
- `status` is derived, not stored.
- `paymentFrequency = at-maturity` is valid only for `fixed-term` lifecycle states.
- `fixed-term` lifecycle states require a `maturityDate`; `open-ended` states do not.
- Editing fixes the latest stored facts, while recording a change appends new dated events.

## Roadmap

This order reflects current priority, not a strict commitment to implementation details.

### Current Foundation

- Continue strengthening the existing local-first MVP flows.
- Keep the current app usable while extending the event-history model deliberately.

### Next Product Directions

1. Earnings exploration
2. Planned contributions for projection scenarios
3. Assets grouping and richer portfolio exploration
4. Event-history management beyond the current latest-edit and append-only record-change flows
5. More explicit payout and cash-handling modeling

## Open Questions

- How should planned contributions be modeled separately from real recorded events?
- Do payouts happen into a tracked cash balance, or stay conceptual unless reinvestment is disabled?
- Do we need separate concepts for principal, current balance, and accumulated unpaid returns?
- Should personal loans and institutional products keep sharing the same schema in V1?
- Do we keep `notes` in MVP, or trim them until later?

## Current Guidance

- Use this file for the current story of the product.
- If a section starts reading like a spec, move it into [Domain Model](./domain-model.md).
- If a note is mostly historical, move it into [Decision Log](./decision-log.md).
- If an idea is not active yet, move it into [Backlog](./backlog.md).
