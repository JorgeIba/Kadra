# Kadra

Kadra is a privacy-first, local-first PWA for tracking fixed-income
investments. It helps a person quickly understand their invested balance,
estimated income, projected growth, and upcoming maturities without a
brokerage-style interface.

## Product Direction

- Mobile-first, especially an installed iPhone PWA
- Local-only data storage, with no login or third-party tracking
- Downloadable portfolio backups for safe local recovery after reinstalling
- Fixed-income investments first, with MXN as the required MVP currency
- Calm, exact, private ledger experience rather than trading software

## Local Backups

Use **Export backup** from the app menu before reinstalling the PWA. Restoring
that JSON file replaces the current local portfolio after Kadra validates it.
Backup files contain your complete investment history and are not encrypted, so
keep them only in storage you trust.

## Documentation

- [Project plan](./docs/project-plan.md)
- [Product context](./PRODUCT.md)
- [Design system](./DESIGN.md)
- [Brand identity](./docs/brand/README.md)
- [Domain model](./docs/domain-model.md)
