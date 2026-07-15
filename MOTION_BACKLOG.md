# Kadra motion backlog

Deferred after the first motion pass. These ideas are intentionally not part of
the current implementation so each can be evaluated on a real device before
adding more movement.

## Dashboard

- Refresh only changed portfolio totals after a deliberate save or record
  change: a short 6px value crossfade and a restrained primary-surface wash.
- Give tappable earnings, projection, and allocation reports a shared pressed
  state: 0.995 scale on press and a 2px trailing-arrow movement.
- Refine the money-privacy reveal into an icon and value crossfade if blur is
  not smooth enough on lower-powered phones.

## Reports

- Keep charts static on entry; animate the changed line and endpoint only when
  projection inputs change.
- Add touch/focus feedback to chart points instead of a generic line-draw on
  every mount.
- Shorten progress-bar fills to the shared 220–260ms motion range.

## Forms and utility controls

- Fold fixed-term-only form controls in and out with bounded layout motion.
- Add a one-time validity-unlock acknowledgement to the save button.
- Use compact, anchored 160ms motion for menus and selects; do not add broad
  decorative movement to utility controls.

## System cleanup

- Replace the grouped-metric-panel height transition with bounded layout/FLIP
  motion if device testing shows it janks.
- Normalize route, list, dialog, and chart timings around the shared motion
  tokens, while preserving reduced-motion alternatives.
