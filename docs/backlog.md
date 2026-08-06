# Kadra Backlog

This document holds future ideas and deferred work that are worth remembering, but are not the top-level story of the project right now.

## Nearer-Term Product Directions

1. Strengthen earnings exploration
2. Add planned contribution assumptions for projections
3. Add richer grouping and exploration in Assets
4. Add history-management flows beyond latest-event edit and append-only record change

## Deferred Ideas

- withdrawals / negative capital movements; MVP money events should stay
  positive-only contributions until we deliberately design subtraction rules,
  validation, and storage shape
- backdated record changes that insert events between existing history; current
  MVP record changes should only append on or after the latest stored event date
- manual adjustments such as top-ups and correction entries
- edit-history flow that lets the user choose which contribution, rate period, or lifecycle period to edit or remove instead of only editing the latest event
- when full or in-between event-history editing is added, keep an edited event's
  `effectiveDate` between its previous and next event dates for that same event history:
  `previous event date <= edited effectiveDate <= next event date`
- explicit same-day event ordering with timestamps or sequence numbers when date-only precision is not enough
- per-investment earnings breakdowns beyond the current first pass
- future-dated investment starts, where `startDate` can be after today and the
  UI treats the investment as promised or starting soon instead of active
- fully historical investments where both `startDate` and `endDate` are before
  today, so Kadra can record past investments and calculate total money earned
- replace silent date clamping before an investment's `startDate` with a clearer
  user-facing behavior, such as an error message or another explicit state; this
  needs product discussion before implementation
- form draft restore so a screen crash does not risk losing in-progress user input
- more detailed payout schedule anchoring, such as weekly-on-Tuesday or monthly-on-specific-day
- custom production domain after the free Vercel URL is validated on iPhone
- Vercel Speed Insights or similar real-user performance monitoring after MVP usage starts
- if route transitions ever make the top bar, bottom nav, or app shell flicker,
  investigate the root-level View Transition as a likely cause; the fix may be
  scoping the transition to the routed screen/outlet instead of `root`
- for reinvested fixed-term CD projections, retain the original lifecycle's payout behavior when creating the simulated renewal. In particular, a `to-cash` CD's earlier weekly or monthly payouts must remain cash; a projection must not rewrite that history as automatic reinvestment. Later, model a projection-only maturity transfer and explicit payout/cash handling so the renewal starts with exactly the proceeds available at maturity. For `at-maturity` payment frequencies, the current simulated renewal falls back to daily compounding; exact interval-based rolling fixed terms remain a future improvement.
- restore accessible single-selection semantics for the expanding maturity picker: expose the expanded choices as native radios, or an equivalent `radiogroup`/`radio` pattern with selected-state announcements and keyboard navigation, while preserving the Motion layout choreography; keep the collapsed control as a disclosure button and verify the screen-reader and focus behavior.

## Notes

- Backlog items are not promises.
- When a backlog item becomes active, summarize it in `project-plan.md` and move deeper detail into the right supporting doc.
