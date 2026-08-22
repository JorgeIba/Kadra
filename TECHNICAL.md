# Kadra technical overview

This document explains how Kadra is built. The [README](README.md) is the
product-facing introduction; this is where implementation details, architecture,
and development commands belong.

## Stack

- React 19 and React Router for the application UI.
- TypeScript 6 for the application and domain model.
- Vite 7 for development and production builds.
- Vite PWA and Workbox for the installable PWA experience.
- Tailwind CSS, shadcn/ui, and Base UI for the interface primitives.
- Vitest for automated tests, with ESLint and Prettier for quality checks.

## Architecture at a glance

Kadra is a client-side application with a deliberate separation between the
product UI, application concerns, and investment-domain logic:

```text
User-entered facts
        ↓
Investment source of truth
        ↓
Dated event histories
        ↓
Derived timelines and calculations
        ↓
Resolved investment and portfolio read models
        ↓
Dashboard, investment detail, earnings, and projections
```

The main areas of the codebase are:

- `src/app/` — screens, routing, application state, storage, backups, and UI behavior.
- `src/domain/investments/` — investment types, event histories, calculations, and read models.
- `src/components/` — shared UI primitives.
- `src/index.css` — the runtime color tokens, typography, motion, and application layout.

## Historical domain model

An `Investment` is the persisted source of truth. Facts that change over time
are represented as dated events rather than mutable “current” fields:

- `contributionEvents` record money added to an investment.
- `rateEvents` record the annual rate that became effective on a date.
- `lifecycleEvents` record changes such as open-ended or fixed-term behavior,
  payment frequency, reinvestment behavior, and maturity.

Each event has an `effectiveDate`, which lets the app reconstruct the investment
as it existed at a selected date. The past remains inspectable while later
changes can still affect future calculations.

The application derives internal views from those histories rather than
persisting duplicated snapshots:

- Rate and lifecycle periods describe which terms were active during each interval.
- Terms segments combine contribution state with the active rate and lifecycle.
- Balance timelines calculate starting balance, earned interest, and ending balance.
- `ResolvedInvestment` is the read model used by UI features for a selected date.
- Portfolio read models expose aggregate values, analysis, and projections.

This is the technical reason Kadra can present an investment as an evolving
story instead of a single overwritten record. The user-facing benefit is
traceability; the event and read-model architecture is the mechanism behind it.

For deeper domain rules and date semantics, see the [domain model](docs/domain-model.md).

## Persistence and backups

The core investment data is persisted in the browser with `localStorage` under
the `kadra.investments.v1` key. The app can continue working without a cloud
account or backend.

Backups are exported as JSON through a versioned envelope:

- format: `kadra.portfolio-backup`
- version: `1`
- export timestamp
- complete investment and event histories

Backup imports are validated with Zod before they are accepted. Backup files
are not encrypted by Kadra; users are responsible for storing them safely.

## Development

### Prerequisites

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)

### Install and run

```bash
pnpm install
pnpm dev
```

Open the local Vite URL printed in the terminal.

### Verification

```bash
pnpm check
```

`pnpm check` runs the complete local quality gate:

1. Prettier format check.
2. ESLint.
3. Vitest test suite.
4. TypeScript compilation and Vite production build.

Individual commands are available when iterating:

```bash
pnpm format:check
pnpm lint
pnpm test
pnpm build
```

## Testing focus

Tests cover the parts of the product where a small mistake can change the
meaning of a financial number:

- dated rate and lifecycle periods;
- contribution state and timeline boundaries;
- balance calculations and projected earnings;
- resolved investment and portfolio read models;
- storage and backup validation;
- important UI flows and components.

## Related documentation

- [Product context](PRODUCT.md) — the product’s users, purpose, boundaries, and principles.
- [Design system](DESIGN.md) — visual language and interface rules.
- [Domain model](docs/domain-model.md) — detailed investment and date semantics.
- [Project plan](docs/project-plan.md) — current direction and roadmap.
