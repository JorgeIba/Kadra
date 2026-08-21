# Kadra Brand Identity

Kadra is the selected product name for this personal, fixed-income-first
investment companion. The identity should feel clear, personal, precise,
curious, rewarding, and quietly playful. It supports a focused portfolio
check-in without borrowing the urgency of a trading product or the promotional
language of a consumer bank campaign.

This document is the source of truth for Kadra’s identity assets, colors,
wordmark, and usage rules.

## Core System

| Role | Decision |
| --- | --- |
| Product name | Kadra |
| App icon | The Kadra Angle mark only, with no text |
| Primary mark | A mint vertical stem and one rising four-point diagonal with a flat base |
| Wordmark | Lowercase `kadra` in Elms Sans Regular |
| Primary lockup | Mark left of the wordmark |
| Launch lockup | Mark above the wordmark, centered |
| Icon / launch field | `#060D0C` |
| Mark color | `#9BD8C2` |

The editable source mark is [kadra-angle.svg](./kadra-angle.svg). The canonical
full-field app-icon source is [kadra-app-icon.svg](./kadra-app-icon.svg). The
visual comparison and scale study live in [icon-lab.html](./icon-lab.html).

## Prepared Exports

The approved export pack is in [exports](./exports/):

- `kadra-favicon.svg`
- `kadra-icon-16.png`, `kadra-icon-32.png`, and `kadra-icon-64.png` for scale checks
- `kadra-apple-touch-icon-180.png`
- `kadra-pwa-192x192.png`
- `kadra-pwa-512x512.png`
- `kadra-pwa-maskable-512x512.png`
- `kadra-launch.png`, the rendered stacked lockup used as the launch-artwork source
- `apple-splash-*.png`, the device-specific startup images for modern iPhones

The PWA exports intentionally use the same full-field source. The mark occupies
the central safe area, so platform masks can round or crop the outer field
without cutting the K.

## Apple PWA Launch Images

Apple startup images use the centered stacked lockup on the identity field.
They support the distinct viewport profiles used by iPhone 14 through iPhone
17, including iPhone Air and Pro models. They are native PWA startup images,
not an app-owned loading screen: the app does not delay rendering or add a
separate launch route. Older iPhones and iPads use the standard iOS fallback.

The editable artwork source is [kadra-launch-source.html](./kadra-launch-source.html).
The image generator configuration is [pwa-assets.config.ts](../../pwa-assets.config.ts).
After changing the launch artwork, recreate `public/kadra-launch.png` from the
source and run `pnpm generate:apple-splash`; keep the generated image links in
`index.html` in sync.

## Usage Rules

- Use the mark alone for app icons and small square contexts.
- Use the horizontal lockup where a compact product identity is needed, such as
  a top bar.
- Use the stacked lockup for the launch screen and spacious centered contexts.
- Keep the wordmark as live Elms Sans Regular text when the platform supports
  it. Do not replace it with hand-drawn letter vectors.
- Preserve the selected mark geometry. The diagonal is a four-point shape with
  a flat horizontal base, not a triangle.

## Do Not Use

- Gradients, shadows, frames, charts, coins, bank crests, shields, or text
  inside the app icon.
- The old placeholder mark or a different green for Kadra identity assets.
- The wordmark typeface for financial values, labels, or general UI copy. The
  product UI continues to use its existing serif-and-Geist system.
