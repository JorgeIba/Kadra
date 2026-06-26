---
target: src/app/screens/dashboard/PortfolioProjectionChart.tsx
total_score: 22
p0_count: 0
p1_count: 2
timestamp: 2026-06-26T06-40-41Z
slug: app-screens-dashboard-portfolioprojectionchart-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Target-date validation is visible, but projection recalculation, chart scale, and assumptions are too quiet. |
| 2 | Match System / Real World | 3 | Fixed-income language is mostly grounded; earning pace is useful but needs clearer temporal framing. |
| 3 | User Control and Freedom | 2 | Back exists, but projection exploration is limited to one date input and an ambiguous dashboard card action. |
| 4 | Consistency and Standards | 2 | Colors and typography are coherent, but the projection flow conflicts with the no-floating-card ledger system. |
| 5 | Error Prevention | 3 | The target date prevents past dates and exposes an inline validation message. |
| 6 | Recognition Rather Than Recall | 2 | Users must infer chart scale, projection meaning, and how the date affects pace and breakdown. |
| 7 | Flexibility and Efficiency | 1 | No quick horizons, maturity-aware shortcuts, or scenario presets exist. |
| 8 | Aesthetic and Minimalist Design | 2 | Clean and restrained, but repeated cards and metric tiles create generic dashboard segmentation. |
| 9 | Error Recovery | 2 | Date recovery is clear; broader empty, edge, and no-active-investment states are less evident from the UI. |
| 10 | Help and Documentation | 1 | Assumptions are present, but projection confidence, maturity effects, and calculation meaning are under-explained. |
| **Total** | | **22/40** | **Acceptable, but drifting away from the private-ledger direction.** |

## Anti-Patterns Verdict

**LLM assessment**: Moderate AI-slop risk. The palette, serif money values, compact labels, and fixed-income copy are coherent enough that the UI does not feel disposable. The main tell is structural: stacked rounded cards, nested metric tiles, hover-lift panels, and chart modules make the projection flow feel like competent shadcn SaaS rather than Trafin's private yield ledger.

**Deterministic scan**: The bundled detector returned zero findings for:

- `src/app/screens/dashboard/PortfolioProjectionChart.tsx`
- `src/app/components/PortfolioEarningPaceMetrics.tsx`
- `src/app/screens/projection/ProjectionScreen.tsx`

No deterministic anti-pattern rules fired.

**Visual overlays**: Browser visualization was attempted at the capability level, but no reliable user-visible overlay is available. The Browser plugin did not expose tab/navigation/screenshot tools in this session, and the available Node runtime does not have Playwright installed. No in-page injection or `[Human]` overlay was created.

## Overall Impression

The projection work is useful, calm, and clearly built around real fixed-income questions. The biggest opportunity is presentation: it should feel like a dated ledger statement that answers "where will my money be by then?" instead of a screen of projection widgets.

## What's Working

- The dark palette, mint restraint, and serif financial values still fit Trafin's privacy-first ledger identity.
- The target-date validation is practical and accessible: `min={today}`, `aria-invalid`, and inline error copy are the right product instincts.
- Reusing the projection chart across dashboard and detail preserves continuity between preview and full screen.

## Priority Issues

**[P1] Projection detail is too card-heavy for the ledger north star**

Why it matters: The design system says Trafin should prefer a continuous dark ledger surface with dividers. `ProjectionScreen.tsx` uses three stacked `Card`s, and `PortfolioEarningPaceMetrics.tsx` adds three rounded metric tiles inside those surfaces. The result is clear, but it feels like a generic dashboard stack.

Fix: Recast the screen as one continuous ledger statement: target-date row, primary projected-earnings/value sentence, chart band, earning-pace rows, then investment breakdown separated by dividers. Reserve framed panels for editable controls.

Suggested command: `$impeccable layout`

**[P1] The chart is calm but semantically underpowered**

Why it matters: A fixed-income projection chart needs to answer what changes, when, and why. The current chart hides the Y axis, exposes values mainly through tooltip interaction, and does not mark target value, start value, or maturity effects. That weakens trust, especially on mobile and for accessibility users.

Fix: Add visible start/end value anchors, a target-date annotation, and a non-hover textual summary. If maturity changes affect the curve, mark those moments quietly.

Suggested command: `$impeccable polish`

**[P2] Earning pace is useful, but presented as fragmented KPI noise**

Why it matters: Per-day, per-month, and per-year pace are valuable, but as three equal tiles they compete with projected earnings, projected value, current value, and the chart. The screen asks the user to synthesize too many numeric blocks.

Fix: Present pace as a compact ledger row group, or make one pace primary with the others inline as secondary context. Use stronger labels such as "Today's earning pace" and "Pace on target date."

Suggested command: `$impeccable distill`

**[P2] Dashboard projection card has ambiguous click behavior**

Why it matters: The card uses a non-native clickable `Card` with `role="button"` and a small arrow, while the chart area stops click propagation. On mobile, the chart is the most tempting tap target, so the interaction can feel inconsistent.

Fix: Choose one model. Either make the preview a clear native button/link surface, or keep chart interaction separate and add an explicit "View projection" action.

Suggested command: `$impeccable harden`

**[P2] Projection detail lacks a clear thesis**

Why it matters: The title says "Estimate what the current portfolio could make," then the user immediately gets controls and metrics. The screen should answer before it explains.

Fix: Lead with one serif statement: "By [target date], this portfolio is projected to earn [amount]." Then support it with current value, projected value, chart, pace, and breakdown.

Suggested command: `$impeccable clarify`

## Persona Red Flags

**Alex (Power User)**: Alex wants fast scenario checks, but the screen offers only a raw date input. There are no quick ranges like 30 days, 90 days, 1 year, year-end, or next maturity.

**Sam (Accessibility-Dependent User)**: Sam may miss chart meaning because the Y axis is hidden and values rely on tooltip discovery. The dashboard projection card also uses a non-native `role="button"` container rather than a native button/link.

**Casey (Distracted Mobile User)**: Casey has to parse a date input, four metric tiles, a chart, three pace metrics, and a ranked breakdown. The most useful answer needs to be higher, singular, and easier to remember.

**Private Fixed-Income Checker**: This user wants reassurance without brokerage noise. The projection flow provides numbers, but not enough calm interpretation about what is still earning, what matured, and what changed by the target date.

## Minor Observations

- `ProjectionMetric` uses the ledger serif correctly, but repeated tiles flatten priority.
- The calendar icon beside a native date input feels mostly decorative.
- "Growth forecast" is clear, but a little generic for Trafin's private-ledger tone.
- Hover lift on the dashboard projection card slightly conflicts with the flat ledger rule.
- The chart color is on-brand; the issue is context and interpretation, not palette.

## Questions to Consider

- What if Projection were a dated ledger statement rather than a screen of cards?
- What is the one sentence the user should remember after viewing the forecast?
- Should earning pace be a dashboard metric, or supporting evidence explaining why the projection moves?
- Where should maturities visibly interrupt the chart, since fixed-income value depends on them?
