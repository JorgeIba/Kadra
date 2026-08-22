---
name: Kadra
description: Personal fixed-income investment companion.
colors:
  background: "#0B1113"
  foreground: "#F4F1EA"
  surface: "#101719"
  surface-muted: "#151D20"
  muted-foreground: "#8D98A3"
  primary: "#9BD8C2"
  primary-foreground: "#0B1113"
  border: "#182225"
  destructive: "#F97066"
typography:
  display:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "2.5rem"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "0"
  headline:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "0"
  title:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0"
  body:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  label:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "0.14em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "36px"
  section-row:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.sm}"
    padding: "16px 0"
  progress-bar:
    backgroundColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    height: "4px"
---

Source of truth: the runtime palette in `src/index.css`. This document records its human-readable hex equivalents; update both files together when the palette changes.

# Design System: Kadra

## 1. Overview

**Creative North Star: "The Personal Investment Companion"**

Kadra should feel like a personal place to check in on fixed-income investments: clear, rewarding, quietly playful, and easy to scan from a phone. The preferred visual baseline is `assets/screens/kadra-dashboard-iphone-17-pro-max.png`.

The interface is not card-heavy. It uses a dark charcoal canvas, thin dividers, serif financial values, compact sans labels, muted blue-gray support text, and restrained mint accents for value, progress, and selected navigation states.

The system rejects generic SaaS dashboards, crypto trading interfaces, loud marketing sites, and promotion-heavy consumer banking apps. These boundaries keep financial information focused without making every interaction austere.

The selected identity is documented in [docs/brand/README.md](docs/brand/README.md). Its Elms Sans Regular wordmark is a brand asset only; it does not replace the UI typography system below.

**Key Characteristics:**

- Dark mobile portfolio composition.
- Large serif portfolio value as the first read.
- Compact sections separated by hairline dividers.
- Mint accent used for value, active state, and expressive interaction feedback.
- Calm financial data paired with tactile, memorable state changes.
- No floating card grid as the default dashboard structure.

## 2. Colors

The palette is dark-first and restrained. Near-black surfaces carry the product, mint accents carry value and active state, and blue-gray text carries supporting metadata.

### Primary

- **Mint Yield**: The product accent for positive values, progress bars, selected navigation, and compact status pills.

### Neutral

- **Kadra Black**: The app background and dominant dashboard surface.
- **Raised Charcoal**: Subtle secondary surface for pills, icons, and controls.
- **Warm Ink**: Main values and headings.
- **Quiet Blue Gray**: Labels, captions, secondary metrics, and chart axis text.
- **Divider Charcoal**: Hairline separators between sections and rows.

### Named Rules

**The Continuous Surface Rule.** The dashboard is mostly one continuous dark surface. Use dividers and spacing before adding cards.

**The Mint Rarity Rule.** Mint is for meaning: value, progress, active state, and urgency. It is not decoration.

## 3. Typography

**Display Font:** Georgia or Times-compatible serif
**Body Font:** Geist Variable, sans-serif
**Label/Mono Font:** Geist Variable, sans-serif

**Character:** Serif type gives financial values and asset names a grounded, personal quality. Geist keeps labels, navigation, and metadata crisp.

### Hierarchy

- **Display** (400, 40px, tight line-height): Total portfolio value and other hero financial numbers.
- **Headline** (700, 16px, compact line-height): Section titles such as Distribution, Growth forecast, and Active assets.
- **Title** (400, 16px, compact line-height): Investment names and row titles.
- **Body** (400, 14px, relaxed line-height): Supporting descriptions, APY metadata, and row notes.
- **Label** (500, 11px, tracked uppercase): Sparse section labels such as TOTAL PORTFOLIO VALUE, BY TYPE, and BY STATUS.

### Named Rules

**The Serif Money Rule.** Important financial values and asset names use the serif voice. Controls and metadata stay sans.

**The Sparse Label Rule.** Uppercase tracking is allowed only for compact dashboard labels, not as repeated decoration everywhere.

## 4. Elevation

The baseline uses almost no shadows. Depth comes from a continuous dark surface, hairline dividers, muted rows, and small filled status pills.

### Shadow Vocabulary

- **None by default**: Dashboard sections, rows, and charts should sit flat on the continuous surface.

### Named Rules

**The No Floating Cards Rule.** Dashboard data should not become a stack of rounded cards. Use card containers only when the interaction genuinely needs a framed tool or modal.

## 5. Components

### Buttons

- **Shape:** Compact controls with restrained 8px radius.
- **Primary:** Mint filled action for rare primary commands.
- **Hover / Focus:** State changes should be visible but quiet, using border, tint, or focus ring.
- **Ghost:** Low-emphasis actions should remain text-first and avoid heavy fills.

### Chips

- **Style:** Small charcoal pill with mint text for positive timing or status.
- **State:** Use for short maturity timing labels such as "In 56 days".

### Cards / Containers

- **Corner Style:** Avoid dashboard cards as the default pattern.
- **Background:** Use one dark canvas with subtle row sections.
- **Shadow Strategy:** Flat by default.
- **Border:** Use thin horizontal dividers.
- **Internal Padding:** Mobile rhythm should feel compact but breathable.

### Inputs / Fields

- **Style:** Dark filled fields with thin borders and clear contrast.
- **Focus:** Mint or high-contrast focus state.
- **Error / Disabled:** Errors must remain readable on the dark surface.

### Navigation

- **Top Bar:** Kadra horizontal lockup (Kadra Angle mark plus wordmark) and compact profile affordance.
- **Bottom Nav:** Icon-first, low-contrast inactive state, mint active state. Keep labels short.

### Motion

- **Financial data:** Values, labels, and charts remain stable and readable while users inspect them.
- **Stateful interaction:** Search, navigation, selection, progress, and reversible actions may use more expressive motion when it clarifies what changed.
- **Signature moments:** A small number of tactile or playful transitions can carry Kadra's personality instead of applying generic animation everywhere.
- **Accessibility:** Every expressive transition has a reduced-motion alternative that preserves state and feedback.

**The Calm Data, Playful Interaction Rule.** Keep the portfolio dependable; let the interaction around it feel alive.

### Dashboard Rows

Distribution, maturity, and active-asset rows should be horizontally scannable: title left, value right, supporting metadata below, and progress or status only when it adds information.

## 6. Do's and Don'ts

### Do:

- **Do** use `assets/screens/kadra-dashboard-iphone-17-pro-max.png` as the current visual baseline.
- **Do** make the total portfolio value the dominant first read.
- **Do** use serif type for money and asset names.
- **Do** use thin dividers and spacing before introducing cards.
- **Do** reserve mint for value, progress, status, and active navigation.
- **Do** use distinctive motion selectively for reversible state changes and discovery.

### Don't:

- **Don't** make Kadra feel like a generic SaaS dashboard.
- **Don't** use crypto trading interface patterns, noisy chart colors, or speculative-investing visual language.
- **Don't** make the product feel like a loud marketing site.
- **Don't** use promotion-heavy consumer banking patterns.
- **Don't** turn the dashboard into a grid of rounded cards.
- **Don't** animate financial values in ways that make them harder to compare or trust.
- **Don't** add decorative shadows or glass effects to the continuous surface.
