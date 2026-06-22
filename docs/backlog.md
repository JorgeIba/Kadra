# Trafin Backlog

This document holds future ideas and deferred work that are worth remembering, but are not the top-level story of the project right now.

## Nearer-Term Product Directions

1. Strengthen earnings exploration
2. Add actual contributions / capital history
3. Add planned contribution assumptions for projections
4. Add rate history
5. Add lifecycle history for transitions between `open-ended` and `fixed-term`
6. Add richer grouping and exploration in Assets

## Deferred Ideas

- withdrawals / negative capital movements; MVP money events should stay
  positive-only contributions until we deliberately design subtraction rules,
  validation, and storage shape
- backdated record changes that insert events between existing history; current
  MVP record changes should only append on or after the latest stored event date
- manual adjustments such as top-ups and correction entries
- edit-history flow that lets the user choose which contribution, rate period, or lifecycle period to edit or remove instead of only editing the latest event
- explicit same-day event ordering with timestamps or sequence numbers when date-only precision is not enough
- per-investment earnings breakdowns beyond the current first pass
- user-editable investment start dates with safe validation
- route-level/component-level error boundaries plus form draft restore so a
  screen crash does not risk losing in-progress user input
- more detailed payout schedule anchoring, such as weekly-on-Tuesday or monthly-on-specific-day
- custom production domain after the free Vercel URL is validated on iPhone
- Vercel Speed Insights or similar real-user performance monitoring after MVP usage starts

## Notes

- Backlog items are not promises.
- When a backlog item becomes active, summarize it in `project-plan.md` and move deeper detail into the right supporting doc.
