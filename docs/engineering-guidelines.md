# Engineering Guidelines

This document tracks cross-cutting technical conventions for Trafin.

## Dates

- Persist dates as ISO-8601 strings.
- Use `YYYY-MM-DD` for business calendar dates, such as `startDate` and `endDate`.
- Use full ISO datetime strings for audit timestamps, such as `createdAt` and `updatedAt`.
- Convert persisted date strings into date objects only at calculation or formatting boundaries.
- Prefer a date utility library for date math instead of hand-rolled calculations.
- Keep date helper wrappers inside the app so library usage does not spread everywhere.
- Treat `YYYY-MM-DD` calendar date strings as a deliberate domain type, not as arbitrary text.
- This convention is Temporal-friendly: later, `CalendarDateString` can map cleanly to `Temporal.PlainDate` when browser support is ready.

Current recommendation:

- Use `date-fns` for MVP date parsing, formatting, and calendar-day differences.
- Keep domain-facing helpers such as `getDaysBetween` and `getDaysActive` so the rest of the app does not depend directly on the date library.

## Testing

- Test behavior and domain contracts, not implementation details.
- Prioritize domain tests for money, date, and status logic because mistakes there affect the whole app.
- Keep date-sensitive tests deterministic by passing explicit dates instead of relying on the current day.
- Use React Testing Library style for UI tests: query by visible text, labels, and user actions.
- Avoid snapshot-heavy tests unless they protect a specific, stable output.
- Keep mocks minimal; prefer pure functions and sample data where possible.

Current recommendation:

- Use `Vitest` for unit tests.
- Use `@testing-library/react`, `@testing-library/user-event`, and `jsdom` once component tests are needed.
- Add `Playwright` later for full browser flows after the core app paths are stable.

## Formatting And Checks

- Use Prettier for code formatting.
- Use ESLint for code-quality and React rules.
- Keep formatting, linting, tests, and builds as explicit commands instead of background watchers.

Current recommendation:

- Run `pnpm format` to rewrite files with Prettier.
- Run `pnpm format:check` to verify formatting without rewriting.
- Run `pnpm check` before finishing a meaningful slice.

## Accessibility

- Add a short inline comment when code exists mainly for accessibility behavior.
- Keep the comment focused on why the behavior exists, such as keyboard focus or screen-reader semantics.
