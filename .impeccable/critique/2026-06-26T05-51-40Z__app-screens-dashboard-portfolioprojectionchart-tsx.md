---
target: src/app/screens/dashboard/PortfolioProjectionChart.tsx
total_score: 22
p0_count: 0
p1_count: 2
timestamp: 2026-06-26T05-51-40Z
slug: app-screens-dashboard-portfolioprojectionchart-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Projection updates silently when the date changes; there is no explicit as-of or recalculation feedback. |
| 2 | Match System / Real World | 3 | Fixed-income assumptions are mostly plain, but earning pace needs clearer date context. |
| 3 | User Control and Freedom | 2 | Back exists, but dashboard chart/card interaction is ambiguous on touch devices. |
| 4 | Consistency and Standards | 2 | Projection card uses a custom clickable card pattern while nearby dashboard cards use different interaction patterns. |
| 5 | Error Prevention | 3 | Date constraints and validation are present, but invalid projection dates silently clamp in the view model. |
| 6 | Recognition Rather Than Recall | 2 | Users must infer chart scale and remember projection assumptions across sections. |
| 7 | Flexibility and Efficiency | 2 | Date picker is the only projection control; no quick horizons such as 30 days, 90 days, next maturity, or year-end. |
| 8 | Aesthetic and Minimalist Design | 2 | The projection screen is more card-heavy than the private-ledger design direction. |
| 9 | Error Recovery | 2 | Past-date error copy is clear, but there is no quick recovery action such as reset to today. |
| 10 | Help and Documentation | 2 | Assumptions exist, but projection math is not discoverable enough for high-trust financial UI. |
| **Total** | | **22/40** | **Usable and calm, but under-explained and over-carded.** |

## Anti-Patterns Verdict

**LLM assessment**: The flow does not look obviously AI-generated, but it is drifting toward generic fintech dashboard structure. The palette, serif money values, and mint restraint are Trafin-like. The layout is the weak point: stacked cards plus nested metric tiles compete with the private ledger direction.

**Deterministic scan**: The detector returned zero findings for:

- `src/app/screens/dashboard/PortfolioProjectionChart.tsx`
- `src/app/components/PortfolioEarningPaceMetrics.tsx`
- `src/app/screens/projection/ProjectionScreen.tsx`

No deterministic anti-pattern rules fired.

**Visual overlays**: Browser overlay evidence was unavailable in this session. No browser automation tools were exposed, and there was no active Impeccable live server/session.

## Overall Impression

The projection work is useful and directionally right, but the presentation is doing too much in separate boxes. The strongest opportunity is to make Projection feel like a ledger answer with supporting evidence, not a generic dashboard screen.

## What's Working

- The product tone is restrained and honest. “Assumes no future contributions or renewals” builds trust because it names the projection boundary.
- Financial typography is on-brand. Serif money values make the data feel more like a private ledger than SaaS analytics.
- Mint is controlled. The chart line and progress states avoid speculative-investing visual noise.

## Priority Issues

**[P1] Projection screen is too card-heavy for Trafin**

Why it matters: The design system says Trafin should avoid a stack of rounded cards and prefer a continuous dark ledger with dividers. The Projection screen currently uses multiple cards and inner metric tiles, which makes the flow feel generic.

Fix: Rework the Projection screen into a more continuous ledger surface. Promote the main sentence and key numbers near the top, then use dividers for chart, pace, and breakdown.

Suggested command: `$impeccable layout`

**[P1] The chart is calm but semantically underpowered**

Why it matters: The chart hides the y-axis and relies heavily on hover/touch tooltip inspection. For money projections, users need visible anchors so the chart feels trustworthy without interaction.

Fix: Add understated start/end value annotations, a target-date value label, or minimal y-axis anchors. Keep the chart quiet, but make the scale visible.

Suggested command: `$impeccable polish`

**[P2] Dashboard projection tap behavior is ambiguous**

Why it matters: The whole card opens Projection, but the chart blocks propagation. On mobile, users may tap the most interesting part of the card and see nothing happen, which feels broken.

Fix: Choose one interaction model. Either use the same full-card button pattern as Earnings and accept that the chart is preview-only, or make chart interaction primary and use a clear explicit open affordance.

Suggested command: `$impeccable harden`

**[P2] Earning pace needs stronger temporal framing**

Why it matters: “Earning pace today” and “Estimated earning pace” are related but not equivalent. Users may compare them as the same thing without realizing one is target-date active-investment pace.

Fix: Rename with date context: “Today’s earning pace” and “Pace on target date.” Keep the active-investments-only note near the target-date version.

Suggested command: `$impeccable clarify`

**[P3] Breakdown hierarchy is too flat**

Why it matters: A long projected-earnings breakdown can become equal-weight rows with tiny bars, so the user has to scan harder to find the main contributor.

Fix: Highlight the top contributor and make remaining rows quieter. Add maturity or active context when it explains why an investment contributes less.

Suggested command: `$impeccable layout`

## Persona Red Flags

**Alex (Power User)**: Alex wants the answer quickly. The projection screen asks them to scan target date, four metric tiles, chart, pace metrics, and breakdown before the main conclusion is obvious. No quick horizon presets slow them down.

**Sam (Accessibility-Dependent User)**: Sam can navigate the card if keyboard support works, but the custom `role="button"` card and chart click exception are less predictable than native controls. The hidden chart scale also forces tooltip dependence.

**Casey (Distracted Mobile User)**: Casey will tap the chart because it is the most visually interesting part of the card. If that tap does not open Projection and only sometimes reveals a tooltip, the card feels inconsistent.

## Minor Observations

- The Projection H1 is accurate but instructional. “Projected portfolio value” would feel more ledger-like.
- The calendar icon beside the date input may be decorative and could add ambiguity.
- Pace tiles give day, month, and year equal weight, but yearly pace carries more emotional meaning.
- Mint progress bars in every breakdown row may make minor contributors feel more important than they are.

## Questions to Consider

- What if Projection opened with one dominant sentence: “By Sep 25, this portfolio is projected to earn $X,” and everything else became evidence?
- Should Trafin’s projection feel like a charting tool, or like a ledger entry from the future?
- Why is a date picker the primary control instead of fixed-income-native horizons like next maturity, 30 days, 90 days, or year-end?
- Could the dashboard projection preview be a ledger row instead of another card?
