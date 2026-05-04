# Trafin Session Init

## Project Summary

Trafin is a privacy-first PWA for tracking fixed-income investments.

Primary target:

- Mexican users
- MXN-first workflows
- local-only data storage
- no backend
- no login
- no third-party tracking
- installable on iPhone as a standalone PWA

This project is both:

- a real product
- a frontend learning project for a backend-oriented developer

## Current Product Direction

- We do not want to rush into implementation just to have a fake V1.
- We want to design the data model and abstractions before deeper UI work.
- SOFIPOs and CETES are examples of investments, not hardcoded product categories.
- The investment model should be generic enough to support institutional products and personal loans.
- For now, we are focusing on fixed-rate investments.
- Taxes are intentionally out of scope for the current planning phase.

## Working Principles

- Explicit agreements should be written down.
- Architecture and product decisions should be tracked in repo docs.
- We should challenge weak assumptions instead of defaulting to convenience.
- Keep the design modular so future features like reinvestment simulation are possible.

## Planning Source Of Truth

The main living plan is:

- [docs/project-plan.md](docs/project-plan.md)

That file is the single source of truth for:

- explicit decisions
- open questions
- progress tracking
- next recommended steps

## Recommended Behavior For Future Sessions

- Read this file first for high-level context.
- Then read `docs/project-plan.md` for the latest explicit agreements and tracker state.
- Do not assume implementation should start immediately.
- Prefer planning and clarification when the discussion is still architectural.
