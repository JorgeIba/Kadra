# Kadra Design Guidelines

This document defines the current visual direction for Kadra.

It is intentionally short. The goal is to make design decisions easier and more consistent, not to create a large design system before the product needs one.

## Purpose

Kadra is a personal, fixed-income-first investment companion. It gives one person a clear place to check what they own, what it is worth, what it is earning, how it may grow, and what deserves attention.

The interface should feel:

- calm
- clear
- personal
- precise
- curious
- rewarding
- quietly playful
- mobile-first

It should not feel like:

- a generic SaaS dashboard
- a crypto trading app
- a loud marketing site
- a consumer banking app full of promotions

## Product Context

Primary device context for MVP:

- iPhone
- installed as a PWA
- used by one person
- checked briefly, often

Primary dashboard question:

> How much do I have invested, how much is it producing, and what needs attention?

That means design should prioritize fast comprehension while leaving room for personality in the interactions around the data.

## Theme Direction

Current direction:

- dark theme first
- light theme later
- `assets/screenshots_2/dashboard_idea_1.png` is the current visual baseline

Dark theme should use:

- Kadra Black `#0B1113` backgrounds
- Mint Yield `#9BD8C2` accents, used sparingly
- warm off-white text, not pure white everywhere
- strong number contrast
- quieter labels and support text

Avoid:

- pure black everywhere
- bright neon finance aesthetics
- purple-first themes
- glossy glassmorphism as a default

Baseline notes from the selected Stitch direction:

- use one continuous dark surface rather than a stack of cards
- use serif type for major financial values and asset names
- use compact sans labels and muted blue-gray metadata
- use mint only for value, progress, status, and active navigation
- use thin dividers and spacing before adding framed containers

## Visual Personality

Kadra should feel closer to:

- a personal investment companion
- a familiar portfolio check-in
- a focused tool that is pleasant to revisit

It should feel less like:

- social fintech
- hyperactive investing software
- sterile financial software
- default template UI

## Brand Identity

The selected brand specification lives in
[brand/README.md](./brand/README.md). Its decisions are:

- Kadra Angle mark for the app icon
- `#060D0C` field with a `#9BD8C2` mark
- lowercase `kadra` wordmark in Elms Sans Regular
- mark-left horizontal lockup as the primary lockup
- stacked lockup for launch screens

The wordmark font is reserved for identity. Continue using Georgia for major
financial values and Geist for product UI text.

## Color Strategy

Use a restrained palette.

The runtime palette in `src/index.css` is authoritative. These hex values make the core roles explicit for design work:

- background: `#0B1113`
- foreground: `#F4F1EA`
- surface: `#101719`
- muted foreground: `#8D98A3`
- primary: `#9BD8C2`
- border: `#182225`

Default role expectations:

- background: very dark, slightly tinted
- surface/card: darker than neutral gray, visibly separated from background
- primary: muted emerald or green-cyan
- foreground: soft high-contrast light tone
- muted text: readable, but clearly secondary
- destructive: reserved and clear, not oversaturated

Rules:

- numbers may carry slightly stronger contrast than prose
- muted text must still remain readable
- backgrounds and surfaces should not collapse into the same value
- charts should harmonize with the palette, not introduce random colors

## Typography

Typography should support clarity first.

Rules:

- use the existing Geist family unless we make a deliberate typography change later
- emphasize hierarchy through size and weight, not through many font families
- financial numbers should be visually prominent
- section labels should be quieter than card titles and metrics
- avoid all-caps as a repeated visual crutch

## Layout and Spacing

The app should feel comfortable on a phone screen.

Rules:

- keep strong visual hierarchy between primary, secondary, and tertiary sections
- use spacing rhythm deliberately; not every gap should be identical
- cards should feel intentional, not like a repeated scaffold
- avoid nested-card design unless the inner grouping is truly necessary
- safe-area spacing must be respected for top and bottom mobile chrome

## Cards and Surfaces

Cards are allowed, but they should not become the entire design language.

Rules:

- summary cards should feel more important than support cards
- support cards should be quieter and structurally consistent
- border, background, and shadow should work together subtly
- avoid overly rounded shapes
- avoid large decorative shadows paired with decorative borders

## Navigation

Navigation should feel stable and predictable.

Top bar:

- small app identity presence
- clean, not crowded
- reserved for app-level actions only

Bottom nav:

- obvious current-tab state
- easy thumb targeting
- not visually louder than the content

## Dashboard Priorities

Dashboard hierarchy should be:

1. Total portfolio value
2. Estimated daily cash flow
3. Projected portfolio growth
4. Portfolio breakdown and maturity awareness
5. Recent or important investments

If the design makes lower-priority content compete with the top summary, the hierarchy is wrong.

## Motion

Motion should keep financial information calm while giving Kadra a recognizable, tactile personality.

Rules:

- use expressive motion for clear state changes such as search expansion, navigation, selection, progress, and reversible actions
- let a small number of signature interactions feel playful instead of applying the same animation everywhere
- keep monetary values, charts, and comparison states visually stable while users read them
- make focus and interaction available immediately; animation should not delay the task
- avoid idle motion that repeatedly demands attention
- loading states should feel calm, not flashy
- reduced-motion support remains required

## Empty and Loading States

These states matter because MVP users will see them often.

Rules:

- empty states should explain the next useful action clearly
- loading states should preserve structure when possible
- destructive confirmation states should feel safe and deliberate

## Charts and Data Visualization

Charts should behave like product UI, not presentation graphics.

Rules:

- keep the chart visually integrated with the app palette
- prioritize readability over novelty
- avoid using too many hues at once
- labels, axes, and tooltips should feel quieter than the main line or metric

## What To Avoid

- generic purple-on-white defaults
- overuse of tiny uppercase section eyebrows
- decorative gradients as a substitute for hierarchy
- visually identical card grids everywhere
- contrast that looks elegant in isolation but is hard to read on a phone
- animation or decoration that competes with the user's financial information

## Current Working Workflow

For design work in this repo, use this process:

1. Define the user question for the screen.
2. Define the information hierarchy.
3. Choose one visual direction before editing code.
4. Implement one screen at a time.
5. Validate on the deployed iPhone PWA, not only in desktop dev tools.
6. Capture screenshots and iterate from concrete visual feedback.

## AI-Assisted Design Workflow

The practical AI workflow for this project should be:

1. Write or update this design brief first.
2. Gather 2-4 visual references with a short note about what we like in each.
3. Decide the direction in words before editing code.
4. Implement a narrow slice in code.
5. Review screenshots together and adjust.

AI is most useful for:

- generating visual directions
- critiquing hierarchy and spacing
- proposing variants quickly
- translating a design decision into production code

AI is least useful when:

- the brief is vague
- references are missing
- too many screens are changed at once

## Next Design Slice

The next design slice should define Kadra's more expressive interaction language through global investment search. Use that focused feature to establish how tactile motion, result discovery, and reduced-motion behavior work before expanding the language elsewhere.
