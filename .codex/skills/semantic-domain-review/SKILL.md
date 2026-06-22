---
name: semantic-domain-review
description: Review product/domain changes and tests for semantic correctness against real-world fixed-income logic, independent of the current implementation. Use when reviewing money, interest, dates, event histories, projections, lifecycle/rate/contribution behavior, or tests that could accidentally assert app bugs instead of domain truth.
---

# Semantic Domain Review

Use this skill to review whether a change is **true to the domain**, not merely consistent with the code. Treat implementation and tests as claims to verify against product docs, math, and real-world fixed-income reasoning.

## Required Context

Before reviewing, read:

- `docs/project-plan.md`
- `docs/domain-model.md`
- `docs/decision-log.md`
- `docs/backlog.md`
- `docs/engineering-guidelines.md`
- all changed tests and changed domain/adapters/storage files relevant to the feature

Use `init.md` only for broad context if the docs above are insufficient.

## Review Workflow

1. Identify the product/domain behavior the change claims to support.
2. Restate the behavior in plain language before reading implementation details.
3. Derive expected outcomes independently from domain rules or basic math.
4. Compare changed tests against those expected outcomes.
5. Compare implementation against the independently derived behavior.
6. Report only semantic issues, missing semantic coverage, ambiguous product rules, or tests that encode questionable expectations.

## Review Standards

- Prioritize financial correctness, date semantics, event history behavior, and user-facing product meaning.
- Do not accept a test expectation just because the app code produces it.
- Check simple benchmark examples mentally, such as: principal `100`, annual rate `10%`, one year elapsed implies `10` of simple annual return before compounding/product-specific rules.
- Distinguish principal/contributed capital from estimated current value, accrued returns, payouts, and cash withdrawals.
- Distinguish correction/edit flows from append/history flows.
- Treat `effectiveDate` as the date a fact became true in the investment world, not when the user entered it.
- Check same-day and backdated events explicitly when event history changes.
- Flag product ambiguity when the correct behavior depends on an unresolved decision.

## Output Format

Start with findings, ordered by severity:

- `P0`: semantic bug that can materially mislead money/date/history behavior.
- `P1`: likely semantic bug or test asserting the wrong business fact.
- `P2`: missing semantic test coverage or ambiguous rule that could cause bugs soon.
- `P3`: wording/naming mismatch that may confuse future domain work.

For each finding include:

- file and line reference when possible
- the tested or implemented claim
- the independent domain expectation
- why the mismatch matters
- a concrete recommendation

If no findings are found, say so clearly and list residual semantic risks or assumptions.
