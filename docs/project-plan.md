# Trafin Project Plan

This document is the shared source of truth for explicit product and architecture decisions.

## How We Use This File

- Only agreed decisions go into the `Agreed Decisions` sections.
- Anything still under discussion goes into `Open Questions`.
- The tracker is the high-level progress board for the project.
- When a decision changes, we update this file instead of letting assumptions drift in chat.

## Tracker

| Area | Status | Notes |
| --- | --- | --- |
| Product direction | In progress | Privacy-first, local-only PWA confirmed |
| V1 domain model | In progress | Core fields and several semantics now agreed |
| Financial rules | In progress | Fixed annual rate agreed for MVP; taxes deferred |
| Screen contracts | Pending | To define after data model |
| Component tree | Pending | To define after screen contracts |
| Persistence strategy | Pending | Likely `localStorage` first, but not locked |
| PWA strategy | Pending | Installable iPhone standalone app remains a goal |
| Landing page / app shell | Pending | Need to decide whether we want a marketing page or only app shell |

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
- Taxes are out of scope for the current planning pass and should not drive the first data model.

### Core Investment Concept

Current shared understanding:

An investment is an asset you own that has capital allocated to it and may produce returns over time according to one or more payout/reinvestment rules.

### User-Provided Fields Currently Agreed

- Name
- Institution or counterparty
- Amount currently invested
- Rate
- Payment frequency
- Whether payouts are reinvested
- Currency
- Start date
- End date / finish date
- Status

### Derived Data Currently Agreed

- Return at the end of a custom period
- Progress percentage
- Other computed metrics derived from user-provided investment fields

## Recommended Domain Shape

This section is a proposal, not yet fully agreed.

### Investment

An `Investment` will likely need:

- `id`
- `name`
- `institutionName`
- `principalAmount`
- `currency`
- `rate`
- `rateType`
- `paymentFrequency`
- `reinvestmentMode`
- `startDate`
- `endDate`
- `notes`
- `createdAt`
- `updatedAt`

### Things We Should Clarify Next

- Whether `amount currently invested` should be stored as current principal, original principal, or both
- Whether reinvestment is only `true/false` or needs modes later
- Whether payment frequency should be normalized as enum values
- Whether we need support for open-ended investments with no fixed maturity
- Whether status should be fully derived from dates or explicitly stored

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
10. Revisit landing page if still needed.

## Open Questions

- Should we use `docs/` only, or also add a separate `plans/` directory later for execution checklists?
- Do we want a true marketing landing page, or just an internal app shell and dashboard empty state?
- Is `rate` always annual in V1?
- Do payouts happen into cash balance, or are they just conceptual unless reinvestment is enabled?
- Do we need separate concepts for `principal`, `current balance`, and `accumulated unpaid returns`?
- Should personal loans and institutional products share the exact same schema in V1?
- Should V1 allow investments without a known end date?

## Next Recommended Step

Define the V1 investment data model more precisely:

- required fields
- optional fields
- enum values
- raw user inputs vs derived values
- date and rate assumptions
